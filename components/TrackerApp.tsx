"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/use-progress";
import { seasonForEpisode, episodesWatchedInSeason, episodeCount, TOTAL_EPISODES, SEASONS } from "@/lib/seasons";
import { computeRealPace, computeDaysRemaining, computeFinishDate } from "@/lib/pace";
import { readSpoilerGuard, writeSpoilerGuard } from "@/lib/storage";
import { SyncBar } from "./SyncBar";
import { HeroEpisode } from "./HeroEpisode";
import { ProgressBar } from "./ProgressBar";
import { StatsGrid } from "./StatsGrid";
import { PaceControl } from "./PaceControl";
import { SeasonsPanel } from "./SeasonsPanel";
import { RewatchControl } from "./RewatchControl";
import { ExportButton } from "./ExportButton";
import { CelebrationOverlay } from "./CelebrationOverlay";

export function TrackerApp() {
  const {
    syncId,
    progress,
    status,
    setEpisode,
    nudgeEpisode,
    setTargetPace,
    startRewatch,
  } = useProgress();

  const [spoilerGuard, setSpoilerGuard] = useState(true);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const prevEpisodeRef = useRef<number | null>(null);

  useEffect(() => {
    setSpoilerGuard(readSpoilerGuard());
  }, []);

  function toggleSpoilerGuard() {
    setSpoilerGuard((prev) => {
      const next = !prev;
      writeSpoilerGuard(next);
      return next;
    });
  }

  // Detects crossing a season's final episode to fire the celebration once, on the transition.
  useEffect(() => {
    if (!progress) return;
    const prev = prevEpisodeRef.current;
    prevEpisodeRef.current = progress.currentEpisode;
    if (prev === null) return;
    const crossedSeasonEnd = SEASONS.some((s) => prev < s.end && progress.currentEpisode >= s.end);
    if (crossedSeasonEnd) setCelebrationKey((k) => k + 1);
  }, [progress]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.repeat) return; // holding a key must not spam nudges / pollute the pace history

      if (e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "+" || e.key === "Add") {
        e.preventDefault();
        nudgeEpisode(e.shiftKey ? 2 : 1);
      } else if (e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "-" || e.key === "Subtract") {
        e.preventDefault();
        nudgeEpisode(-1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nudgeEpisode]);

  if (!progress || !syncId) {
    return <LoadingSkeleton />;
  }

  const currentSeason = seasonForEpisode(progress.currentEpisode);
  const episodesRemaining = TOTAL_EPISODES - progress.currentEpisode;
  const finished = progress.currentEpisode >= TOTAL_EPISODES;
  const realPace = computeRealPace(progress.history);
  const daysRemaining = computeDaysRemaining(episodesRemaining, progress.targetPace);
  const finishDateLabel = computeFinishDate(daysRemaining);

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <CelebrationOverlay triggerKey={celebrationKey} />

      <header className="relative z-20 mb-5 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[15px] font-semibold tracking-tight text-ink">HxH</span>
          <span className="text-[15px] text-ink-faint">Tracker</span>
        </div>
        <SyncBar syncId={syncId} status={status} spoilerGuard={spoilerGuard} onToggleSpoilerGuard={toggleSpoilerGuard} />
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="flex flex-col gap-5 lg:gap-6">
          <HeroEpisode
            currentEpisode={progress.currentEpisode}
            season={currentSeason}
            spoilerGuard={spoilerGuard}
            episodesInSeasonWatched={currentSeason ? episodesWatchedInSeason(currentSeason, progress.currentEpisode) : 0}
            seasonEpisodeCount={currentSeason ? episodeCount(currentSeason) : 0}
            onNudge={nudgeEpisode}
            onSetEpisode={setEpisode}
          />

          <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.05] sm:p-5">
            <ProgressBar currentEpisode={progress.currentEpisode} activeSeasonId={currentSeason?.id ?? null} />
          </div>

          <StatsGrid
            episodesRemaining={episodesRemaining}
            daysRemaining={daysRemaining}
            finishDateLabel={finishDateLabel}
            realPace={realPace}
            targetPace={progress.targetPace}
            finished={finished}
          />

          <PaceControl value={progress.targetPace} onChange={setTargetPace} />

          <p className="hidden text-center text-[12px] text-ink-faint lg:block">
            Atajos: <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono">→</kbd> +1 ·{" "}
            <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono">Shift</kbd>+
            <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono">→</kbd> +2 ·{" "}
            <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono">←</kbd> −1
          </p>
        </div>

        <aside className="flex flex-col gap-5">
          <div>
            <h2 className="mb-2.5 text-[13px] font-medium uppercase tracking-[0.1em] text-ink-faint">Temporadas</h2>
            <SeasonsPanel currentEpisode={progress.currentEpisode} activeSeasonId={currentSeason?.id ?? null} spoilerGuard={spoilerGuard} />
          </div>

          <div className="flex flex-col gap-2 border-t border-hairline pt-4">
            <RewatchControl rewatchCount={progress.rewatches.length} currentEpisode={progress.currentEpisode} onConfirm={startRewatch} />
            <ExportButton progress={progress} />
          </div>
        </aside>
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mb-8 h-11 animate-pulse rounded-full bg-white/[0.03]" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="flex flex-col gap-5">
          <div className="h-64 animate-pulse rounded-card bg-white/[0.03]" />
          <div className="h-16 animate-pulse rounded-2xl bg-white/[0.03]" />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 h-24 animate-pulse rounded-2xl bg-white/[0.03]" />
            <div className="h-24 animate-pulse rounded-2xl bg-white/[0.03]" />
            <div className="h-24 animate-pulse rounded-2xl bg-white/[0.03]" />
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-white/[0.03]" />
          ))}
        </div>
      </div>
    </main>
  );
}
