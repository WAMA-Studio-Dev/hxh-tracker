import type { Progress } from "./types";

const SYNC_ID_KEY = "hxh:syncId";
const PROGRESS_KEY_PREFIX = "hxh:progress:";
const SPOILER_GUARD_KEY = "hxh:spoilerGuard";

export function readStoredSyncId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SYNC_ID_KEY);
}

export function writeStoredSyncId(syncId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SYNC_ID_KEY, syncId);
}

export function readStoredProgress(syncId: string): Progress | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROGRESS_KEY_PREFIX + syncId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Progress;
  } catch {
    return null;
  }
}

export function writeStoredProgress(progress: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_KEY_PREFIX + progress.syncId, JSON.stringify(progress));
}

export function readSpoilerGuard(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(SPOILER_GUARD_KEY);
  return raw === null ? true : raw === "1";
}

export function writeSpoilerGuard(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SPOILER_GUARD_KEY, enabled ? "1" : "0");
}
