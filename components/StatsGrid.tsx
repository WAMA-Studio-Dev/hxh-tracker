"use client";

import { CalendarCheck, Hourglass, FilmSlate, TrendUp, TrendDown, Minus as MinusIcon } from "@phosphor-icons/react";

export function StatsGrid({
  episodesRemaining,
  daysRemaining,
  finishDateLabel,
  realPace,
  targetPace,
  finished,
}: {
  episodesRemaining: number;
  daysRemaining: number;
  finishDateLabel: string;
  realPace: number | null;
  targetPace: number;
  finished: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatTile
        className="col-span-2"
        icon={<CalendarCheck size={18} weight="bold" />}
        label="Fecha estimada de fin"
        accent="var(--color-license)"
        value={finished ? "Completada" : finishDateLabel}
        big
      />
      <StatTile
        icon={<Hourglass size={18} weight="bold" />}
        label="Días restantes"
        accent="var(--color-killua)"
        value={finished ? "0" : String(daysRemaining)}
      />
      <StatTile
        icon={<FilmSlate size={18} weight="bold" />}
        label="Episodios restantes"
        accent="var(--color-gon)"
        value={String(episodesRemaining)}
      />
      <PaceTile realPace={realPace} targetPace={targetPace} />
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  accent,
  big,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  big?: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.05] sm:p-5 ${className}`}>
      <div className="flex items-center gap-1.5" style={{ color: accent }}>
        {icon}
        <span className="text-[12px] font-medium text-ink-dim">{label}</span>
      </div>
      <p
        className={`mt-2.5 font-mono tracking-tight text-ink tabular ${big ? "text-2xl sm:text-[28px]" : "text-2xl"}`}
      >
        {value}
      </p>
    </div>
  );
}

function PaceTile({ realPace, targetPace }: { realPace: number | null; targetPace: number }) {
  if (realPace === null) {
    return (
      <StatTile
        icon={<MinusIcon size={18} weight="bold" />}
        label="Ritmo real"
        accent="var(--color-ink-faint)"
        value="—"
      />
    );
  }

  const ratio = realPace / targetPace;
  const faster = ratio > 1.05;
  const slower = ratio < 0.95;
  const Icon = faster ? TrendUp : slower ? TrendDown : MinusIcon;
  const accent = faster ? "var(--color-gon)" : slower ? "var(--color-license)" : "var(--color-ink-dim)";

  return (
    <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.05] sm:p-5">
      <div className="flex items-center gap-1.5" style={{ color: accent }}>
        <Icon size={18} weight="bold" />
        <span className="text-[12px] font-medium text-ink-dim">Ritmo real</span>
      </div>
      <p className="mt-2.5 font-mono text-2xl tracking-tight text-ink tabular">{realPace.toFixed(1)}</p>
      <p className="mt-0.5 text-[12px] text-ink-faint">
        caps/día · objetivo {targetPace}
      </p>
    </div>
  );
}
