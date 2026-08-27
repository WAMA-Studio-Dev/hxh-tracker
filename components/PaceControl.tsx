"use client";

import { Gauge, Minus, Plus } from "@phosphor-icons/react";

const MIN = 0.5;
const MAX = 8;
const STEP = 0.5;

export function PaceControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const fillPercent = ((value - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.05] sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-ink-dim">
          <Gauge size={17} weight="bold" />
          <span className="text-[13px] font-medium">Ritmo objetivo</span>
        </div>
        <span className="font-mono text-[13px] text-ink tabular">{value} caps/día</span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(MIN, round(value - STEP)))}
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white/[0.06] text-ink-dim transition-[background-color,transform] duration-150 ease-out hover:bg-white/[0.12] hover:text-ink active:scale-90"
          aria-label="Reducir ritmo objetivo"
        >
          <Minus size={14} weight="bold" />
        </button>

        <input
          type="range"
          className="hxh-range"
          style={{ ["--range-fill" as string]: `${fillPercent}%` }}
          min={MIN}
          max={MAX}
          step={STEP}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Ritmo objetivo de capítulos por día"
        />

        <button
          type="button"
          onClick={() => onChange(Math.min(MAX, round(value + STEP)))}
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white/[0.06] text-ink-dim transition-[background-color,transform] duration-150 ease-out hover:bg-white/[0.12] hover:text-ink active:scale-90"
          aria-label="Aumentar ritmo objetivo"
        >
          <Plus size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
}

function round(n: number) {
  return Math.round(n * 2) / 2;
}
