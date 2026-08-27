"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import { generateSyncId, isValidSyncId } from "./sync-id";
import {
  readStoredProgress,
  writeStoredProgress,
  readStoredSyncId,
  writeStoredSyncId,
} from "./storage";
import type { Progress, HistoryEntry, RewatchEntry } from "./types";
import { TOTAL_EPISODES } from "./seasons";

const DEBOUNCE_MS = 700;

export type SyncStatus = "local" | "syncing" | "synced" | "offline" | "error";

function emptyProgress(syncId: string): Progress {
  return {
    syncId,
    currentEpisode: 0,
    targetPace: 2,
    history: [],
    rewatches: [],
    updatedAt: new Date(0).toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProgress(row: any): Progress {
  return {
    syncId: row.sync_id,
    currentEpisode: row.current_episode ?? 0,
    targetPace: Number(row.target_pace ?? 2),
    history: (row.history as HistoryEntry[]) ?? [],
    rewatches: (row.rewatches as RewatchEntry[]) ?? [],
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

function progressToRow(p: Progress) {
  return {
    sync_id: p.syncId,
    current_episode: p.currentEpisode,
    target_pace: p.targetPace,
    history: p.history,
    rewatches: p.rewatches,
    updated_at: p.updatedAt,
  };
}

function resolveInitialSyncId(): { syncId: string; isNew: boolean } {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get("sync");
  if (fromUrl && isValidSyncId(fromUrl)) {
    return { syncId: fromUrl, isNew: false };
  }
  const stored = readStoredSyncId();
  if (stored && isValidSyncId(stored)) {
    return { syncId: stored, isNew: false };
  }
  return { syncId: generateSyncId(), isNew: true };
}

export function useProgress() {
  const [syncId, setSyncId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [status, setStatus] = useState<SyncStatus>("local");
  const [isOnline, setIsOnline] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<Progress | null>(null);

  progressRef.current = progress;

  // --- bootstrap: resolve syncId, load local cache, sync URL/localStorage ---
  useEffect(() => {
    const { syncId: resolved } = resolveInitialSyncId();
    writeStoredSyncId(resolved);

    const url = new URL(window.location.href);
    if (url.searchParams.get("sync") !== resolved) {
      url.searchParams.set("sync", resolved);
      window.history.replaceState({}, "", url.toString());
    }

    setSyncId(resolved);
    const cached = readStoredProgress(resolved);
    setProgress(cached ?? emptyProgress(resolved));
    setIsOnline(navigator.onLine);
  }, []);

  // --- fetch remote + realtime subscription ---
  useEffect(() => {
    if (!syncId) return;
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("offline");
      return;
    }

    let cancelled = false;

    async function pullRemote() {
      setStatus("syncing");
      const { data, error } = await supabase!
        .from("hxh_progress")
        .select("*")
        .eq("sync_id", syncId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setStatus("error");
        return;
      }

      if (data) {
        const remote = rowToProgress(data);
        const local = progressRef.current;
        if (!local || new Date(remote.updatedAt) > new Date(local.updatedAt)) {
          setProgress(remote);
          writeStoredProgress(remote);
        }
      } else if (progressRef.current) {
        // first time this syncId is seen remotely — seed the row
        await supabase!.from("hxh_progress").upsert(progressToRow(progressRef.current));
      }
      setStatus("synced");
    }

    pullRemote();

    const channel = supabase
      .channel(`hxh_progress:${syncId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hxh_progress", filter: `sync_id=eq.${syncId}` },
        (payload) => {
          if (payload.eventType === "DELETE") return;
          const remote = rowToProgress(payload.new);
          const local = progressRef.current;
          if (!local || new Date(remote.updatedAt) > new Date(local.updatedAt)) {
            setProgress(remote);
            writeStoredProgress(remote);
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [syncId]);

  // --- online/offline tracking, flush on reconnect ---
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      const current = progressRef.current;
      if (current) pushRemote(current);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushRemote = useCallback(async (next: Progress) => {
    const supabase = getSupabaseClient();
    if (!supabase || !navigator.onLine) {
      setStatus("offline");
      return;
    }
    setStatus("syncing");
    const { error } = await supabase.from("hxh_progress").upsert(progressToRow(next));
    setStatus(error ? "error" : "synced");
  }, []);

  const commit = useCallback(
    (next: Progress) => {
      setProgress(next);
      writeStoredProgress(next);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => pushRemote(next), DEBOUNCE_MS);
    },
    [pushRemote],
  );

  const setEpisode = useCallback(
    (episode: number) => {
      const current = progressRef.current;
      if (!current) return;
      const clamped = Math.max(0, Math.min(TOTAL_EPISODES, episode));
      if (clamped === current.currentEpisode) return;
      const now = new Date().toISOString();
      const nextHistory = [...current.history, { date: now, episode: clamped }].slice(-500);
      commit({ ...current, currentEpisode: clamped, history: nextHistory, updatedAt: now });
    },
    [commit],
  );

  const nudgeEpisode = useCallback(
    (delta: number) => {
      const current = progressRef.current;
      if (!current) return;
      setEpisode(current.currentEpisode + delta);
    },
    [setEpisode],
  );

  const setTargetPace = useCallback(
    (pace: number) => {
      const current = progressRef.current;
      if (!current) return;
      const now = new Date().toISOString();
      commit({ ...current, targetPace: Math.max(0.5, pace), updatedAt: now });
    },
    [commit],
  );

  const startRewatch = useCallback(() => {
    const current = progressRef.current;
    if (!current) return;
    const now = new Date().toISOString();
    const startedAt = current.history[0]?.date ?? current.updatedAt;
    const archived: RewatchEntry = {
      id: `${Date.now()}`,
      startedAt,
      completedAt: now,
      finalEpisode: current.currentEpisode,
      history: current.history,
    };
    commit({
      ...current,
      currentEpisode: 0,
      history: [],
      rewatches: [...current.rewatches, archived],
      updatedAt: now,
    });
  }, [commit]);

  const applyImportedProgress = useCallback(
    (imported: Partial<Progress>) => {
      const current = progressRef.current;
      if (!current) return;
      const now = new Date().toISOString();
      commit({
        syncId: current.syncId,
        currentEpisode: imported.currentEpisode ?? current.currentEpisode,
        targetPace: imported.targetPace ?? current.targetPace,
        history: imported.history ?? current.history,
        rewatches: imported.rewatches ?? current.rewatches,
        updatedAt: now,
      });
    },
    [commit],
  );

  return {
    syncId,
    progress,
    status,
    isOnline,
    isSupabaseConfigured,
    setEpisode,
    nudgeEpisode,
    setTargetPace,
    startRewatch,
    applyImportedProgress,
  };
}
