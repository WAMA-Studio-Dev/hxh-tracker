"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import type { Progress } from "@/lib/types";

export function ExportButton({ progress }: { progress: Progress }) {
  function exportJson() {
    const payload = { ...progress, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hxh-progress-${progress.syncId}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportJson}
      className="flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2.5 text-[13px] font-medium text-ink-dim transition-[background-color,color] duration-150 ease-out hover:bg-white/[0.08] hover:text-ink"
    >
      <DownloadSimple size={16} weight="bold" />
      Exportar progreso (JSON)
    </button>
  );
}
