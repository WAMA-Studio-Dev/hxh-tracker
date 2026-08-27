"use client";

import { useRef, useState } from "react";
import { Minus, Plus, PencilSimple } from "@phosphor-icons/react";
import { TOTAL_EPISODES } from "@/lib/seasons";
import type { Season } from "@/lib/types";

export function HeroEpisode({
  currentEpisode,
  season,
  spoilerGuard,
  episodesInSeasonWatched,
  seasonEpisodeCount,
  onNudge,
  onSetEpisode,
}: {
  currentEpisode: number;
  season: Season | null;
  spoilerGuard: boolean;
  episodesInSeasonWatched: number;
  seasonEpisodeCount: number;
  onNudge: (delta: number) => void;
  onSetEpisode: (episode: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(currentEpisode));
  const inputRef = useRef<HTMLInputElement>(null);

  function startEditing() {
    setDraft(String(currentEpisode));
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  }

  function commitEdit() {
    const parsed = Number.parseInt(draft, 10);
    if (!Number.isNaN(parsed)) onSetEpisode(parsed);
    setEditing(false);
  }

  const finished = currentEpisode >= TOTAL_EPISODES;
  const notStarted = currentEpisode === 0;

  return (
    <div className="rounded-card bg-white/[0.035] p-1.5 ring-1 ring-white/[0.06]">
      <div className="rounded-card-inner relative overflow-hidden bg-surface px-5 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-8 sm:py-9">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full opacity-[0.14] blur-3xl"
          style={{ background: season?.color ?? "#10b981", animation: "aura-pulse 6s ease-in-out infinite" }}
          aria-hidden="true"
        />

        <p className="relative text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
          Capítulo actual
        </p>

        <div className="relative mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {editing ? (
            <input
              ref={inputRef}
              type="number"
              min={0}
              max={TOTAL_EPISODES}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="w-[3.5ch] bg-transparent font-mono text-7xl font-semibold tracking-tighter text-ink tabular outline-none sm:text-8xl"
            />
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="group flex items-baseline gap-2 rounded-lg text-left transition-transform duration-150 ease-out active:scale-[0.98]"
              aria-label="Editar capítulo actual"
            >
              <span className="font-mono text-7xl font-semibold tracking-tighter text-ink tabular sm:text-8xl">
                {currentEpisode}
              </span>
              <PencilSimple
                size={18}
                weight="bold"
                className="mb-2 text-ink-faint opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              />
            </button>
          )}
          <span className="font-mono text-2xl text-ink-faint tabular">/ {TOTAL_EPISODES}</span>
        </div>

        <p className="relative mt-3 min-h-[1.5em] text-[15px] text-ink-dim">
          {finished && <span className="text-[var(--color-license)]">Serie completada — enhorabuena, Hunter.</span>}
          {!finished && notStarted && <span>Aún no has empezado a verla.</span>}
          {!finished && !notStarted && season && (
            <>
              {spoilerGuard ? (
                <span>
                  Temporada {season.id} · episodio {episodesInSeasonWatched}/{seasonEpisodeCount} de esta temporada
                </span>
              ) : (
                <span>
                  <span style={{ color: season.color }} className="font-medium">
                    {season.title}
                  </span>
                  {" — "}
                  {season.subtitle}, ep. {episodesInSeasonWatched}/{seasonEpisodeCount} de esta temporada
                </span>
              )}
            </>
          )}
        </p>

        <div className="relative mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <ControlButton label="−1" onClick={() => onNudge(-1)} disabled={notStarted} variant="ghost">
            <Minus size={16} weight="bold" />
          </ControlButton>
          <ControlButton label="+1" onClick={() => onNudge(1)} disabled={finished} variant="primary">
            <Plus size={16} weight="bold" />
          </ControlButton>
          <ControlButton label="+2" onClick={() => onNudge(2)} disabled={finished} variant="secondary">
            <Plus size={16} weight="bold" />
          </ControlButton>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  children,
  label,
  onClick,
  disabled,
  variant,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant: "primary" | "secondary" | "ghost";
}) {
  const base =
    "group flex min-h-[52px] flex-1 basis-[88px] items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] disabled:pointer-events-none disabled:opacity-30 sm:flex-none";

  const variants = {
    primary:
      "bg-[var(--color-gon)] text-[#052017] shadow-[0_8px_24px_-8px_rgba(16,185,129,0.55)] hover:brightness-110",
    secondary: "bg-[var(--color-killua)]/15 text-[var(--color-killua)] ring-1 ring-[var(--color-killua)]/30 hover:bg-[var(--color-killua)]/22",
    ghost: "bg-white/[0.05] text-ink-dim ring-1 ring-white/[0.06] hover:bg-white/[0.09] hover:text-ink",
  };

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        {children}
      </span>
      {label}
    </button>
  );
}
