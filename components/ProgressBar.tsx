"use client";

import { SEASONS, episodeCount, episodesWatchedInSeason, TOTAL_EPISODES } from "@/lib/seasons";

export function ProgressBar({ currentEpisode, activeSeasonId }: { currentEpisode: number; activeSeasonId: number | null }) {
  const percent = Math.round((currentEpisode / TOTAL_EPISODES) * 1000) / 10;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink-dim">Progreso total</span>
        <span className="font-mono text-[13px] text-ink tabular">{percent}%</span>
      </div>

      <div className="flex gap-[3px]">
        {SEASONS.map((season) => {
          const count = episodeCount(season);
          const watched = episodesWatchedInSeason(season, currentEpisode);
          const fillPercent = (watched / count) * 100;
          const isActive = season.id === activeSeasonId;

          return (
            <div
              key={season.id}
              className="h-2.5 overflow-hidden rounded-full"
              style={{ flexGrow: count, flexBasis: 0, backgroundColor: season.colorSoft }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-strong)]"
                style={{
                  width: `${fillPercent}%`,
                  backgroundColor: season.color,
                  boxShadow: isActive && fillPercent > 0 ? `0 0 12px ${season.color}99` : "none",
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 flex gap-[3px]">
        {SEASONS.map((season) => (
          <div key={season.id} className="flex justify-center" style={{ flexGrow: episodeCount(season), flexBasis: 0 }}>
            <span
              className="font-mono text-[10px] tabular"
              style={{ color: season.id === activeSeasonId ? season.color : "var(--color-ink-faint)" }}
            >
              T{season.id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
