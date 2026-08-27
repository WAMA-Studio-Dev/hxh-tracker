"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { SEASONS, episodeCount, episodesWatchedInSeason, isSeasonComplete } from "@/lib/seasons";

export function SeasonsPanel({
  currentEpisode,
  activeSeasonId,
  spoilerGuard,
}: {
  currentEpisode: number;
  activeSeasonId: number | null;
  spoilerGuard: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {SEASONS.map((season) => {
        const total = episodeCount(season);
        const watched = episodesWatchedInSeason(season, currentEpisode);
        const complete = isSeasonComplete(season, currentEpisode);
        const active = season.id === activeSeasonId;

        return (
          <div
            key={season.id}
            className="rounded-2xl p-1 transition-[box-shadow] duration-300 ease-out"
            style={{
              boxShadow: active ? `0 0 0 1.5px ${season.color}66, 0 0 24px -6px ${season.color}55` : "0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <div className="rounded-[1rem] bg-white/[0.025] px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-6 w-6 flex-none items-center justify-center rounded-full font-mono text-[11px] font-semibold tabular"
                    style={{ backgroundColor: season.colorSoft, color: season.color }}
                  >
                    {season.id}
                  </span>
                  <div>
                    <p className="text-[13.5px] font-medium leading-tight text-ink">
                      {spoilerGuard ? `Temporada ${season.id}` : season.title}
                    </p>
                    <p className="text-[12px] leading-tight text-ink-faint">
                      {spoilerGuard ? `Caps. ${season.start}–${season.end}` : season.subtitle}
                    </p>
                  </div>
                </div>

                {complete ? (
                  <CheckCircle size={20} weight="fill" style={{ color: season.color }} className="flex-none" />
                ) : (
                  <span className="flex-none font-mono text-[12px] text-ink-faint tabular">
                    {watched}/{total}
                  </span>
                )}
              </div>

              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-strong)]"
                  style={{ width: `${(watched / total) * 100}%`, backgroundColor: season.color }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
