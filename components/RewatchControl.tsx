"use client";

import { useEffect, useState } from "react";
import { ArrowCounterClockwise, X } from "@phosphor-icons/react";

export function RewatchControl({
  rewatchCount,
  currentEpisode,
  onConfirm,
}: {
  rewatchCount: number;
  currentEpisode: number;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2.5 text-[13px] font-medium text-ink-dim transition-[background-color,color] duration-150 ease-out hover:bg-white/[0.08] hover:text-ink"
      >
        <ArrowCounterClockwise size={16} weight="bold" />
        Volver a verla desde el principio
        {rewatchCount > 0 && (
          <span className="rounded-full bg-[var(--color-killua)]/20 px-1.5 py-0.5 font-mono text-[11px] text-[var(--color-killua)] tabular">
            {rewatchCount}ª vuelta hecha
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          style={{ animation: "rise-in 200ms ease-out" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-hairline bg-surface-raised p-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)]"
            style={{ animation: "rise-in 240ms var(--ease-out-strong)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-[16px] font-semibold text-ink">Empezar una nueva vuelta</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-ink-faint transition-colors hover:text-ink"
                aria-label="Cerrar"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            <p className="mt-2.5 text-[14px] leading-relaxed text-ink-dim">
              Tu progreso actual (capítulo {currentEpisode}) se guardará en el historial de vueltas y el contador
              volverá a 0. No se pierde nada.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-2 text-[13px] font-medium text-ink-dim transition-colors hover:text-ink"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
                className="rounded-full bg-[var(--color-killua)] px-4 py-2 text-[13px] font-semibold text-white transition-[filter,transform] duration-150 ease-out hover:brightness-110 active:scale-[0.97]"
              >
                Empezar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
