"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CloudCheck, CloudSlash, CloudArrowUp, CloudX, LinkSimple, QrCode as QrCodeIcon, Eye, EyeClosed } from "@phosphor-icons/react";
import { QrCode } from "./QrCode";
import type { SyncStatus } from "@/lib/use-progress";

const STATUS_META: Record<SyncStatus, { label: string; icon: typeof CloudCheck; className: string }> = {
  synced: { label: "Sincronizado", icon: CloudCheck, className: "text-[var(--color-gon)]" },
  syncing: { label: "Sincronizando…", icon: CloudArrowUp, className: "text-[var(--color-license)] animate-pulse" },
  local: { label: "Sólo en este dispositivo", icon: CloudSlash, className: "text-ink-faint" },
  offline: { label: "Sin conexión — se guardará al reconectar", icon: CloudSlash, className: "text-ink-dim" },
  error: { label: "Error al sincronizar", icon: CloudX, className: "text-red-400" },
};

export function SyncBar({
  syncId,
  status,
  spoilerGuard,
  onToggleSpoilerGuard,
}: {
  syncId: string;
  status: SyncStatus;
  spoilerGuard: boolean;
  onToggleSpoilerGuard: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const shareUrl = useShareUrl(syncId);

  useEffect(() => {
    if (!qrOpen) return;
    function onDocClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setQrOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setQrOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [qrOpen]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API unavailable — no-op, the link is still visible in the QR panel
    }
  }

  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;

  return (
    <div className="relative flex flex-wrap items-center gap-2 rounded-full border border-hairline bg-surface/70 px-3 py-2 backdrop-blur-xl sm:gap-3 sm:px-4">
      <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1.5" title={meta.label}>
        <StatusIcon size={15} weight="bold" className={meta.className} />
        <span className="font-mono text-[11px] tracking-wide text-ink-dim tabular">{syncId}</span>
      </div>

      <button
        type="button"
        onClick={copyLink}
        className="group flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-[13px] font-medium text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-white/[0.08] active:scale-[0.97]"
      >
        {copied ? (
          <Check size={15} weight="bold" className="text-[var(--color-gon)]" />
        ) : (
          <LinkSimple size={15} weight="bold" className="text-ink-dim transition-colors group-hover:text-ink" />
        )}
        <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar enlace"}</span>
      </button>

      <div ref={panelRef} className="relative">
        <button
          type="button"
          onClick={() => setQrOpen((v) => !v)}
          aria-expanded={qrOpen}
          className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-[13px] font-medium text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-white/[0.08] active:scale-[0.97]"
        >
          <QrCodeIcon size={15} weight="bold" className="text-ink-dim" />
          <span className="hidden sm:inline">QR</span>
        </button>

        {qrOpen && (
          <div
            className="absolute right-0 top-[calc(100%+10px)] z-30 w-[232px] rounded-2xl border border-hairline bg-surface-raised p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]"
            style={{ animation: "rise-in 220ms var(--ease-out-strong)" }}
          >
            <p className="mb-3 text-center text-[12px] text-ink-dim">Escanea para abrir en otro dispositivo</p>
            <div className="flex justify-center">
              <QrCode value={shareUrl} />
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onToggleSpoilerGuard}
        className="ml-auto flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-[13px] font-medium text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-white/[0.08] active:scale-[0.97]"
        title={spoilerGuard ? "Mostrar nombres de arcos" : "Ocultar nombres de arcos"}
      >
        {spoilerGuard ? (
          <EyeClosed size={15} weight="bold" className="text-ink-dim" />
        ) : (
          <Eye size={15} weight="bold" className="text-[var(--color-killua)]" />
        )}
        <span className="hidden sm:inline">{spoilerGuard ? "Spoilers ocultos" : "Spoilers visibles"}</span>
      </button>
    </div>
  );
}

function useShareUrl(syncId: string) {
  const [url, setUrl] = useState(`?sync=${syncId}`);
  useEffect(() => {
    const u = new URL(window.location.origin + window.location.pathname);
    u.searchParams.set("sync", syncId);
    setUrl(u.toString());
  }, [syncId]);
  return url;
}
