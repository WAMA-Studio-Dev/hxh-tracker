"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({ value, size = 168 }: { value: string; size?: number }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(value, {
      type: "svg",
      margin: 1,
      width: size,
      color: { dark: "#0a0d0c", light: "#f4f7f5" },
    }).then((markup) => {
      if (!cancelled) setSvg(markup);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div
      className="flex items-center justify-center rounded-xl bg-[#f4f7f5] p-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
      style={{ width: size + 24, height: size + 24 }}
      role="img"
      aria-label="Código QR para abrir esta app sincronizada en otro dispositivo"
    >
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="h-full w-full animate-pulse rounded-lg bg-black/10" />
      )}
    </div>
  );
}
