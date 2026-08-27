"use client";

import { useEffect, useState } from "react";

const PALETTE = ["#10b981", "#8b5cf6", "#f59e0b", "#6366f1", "#059669"];

type Particle = { id: number; left: number; delay: number; color: string; width: number };

export function CelebrationOverlay({ triggerKey }: { triggerKey: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (triggerKey === 0) return;
    const next = Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 260,
      color: PALETTE[i % PALETTE.length] ?? "#10b981",
      width: 5 + Math.random() * 5,
    }));
    setParticles(next);
    const timeout = setTimeout(() => setParticles([]), 1600);
    return () => clearTimeout(timeout);
  }, [triggerKey]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-48 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 rounded-[1px]"
          style={{
            left: `${p.left}%`,
            width: p.width,
            height: p.width * 0.4,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            animation: `confetti-fall 1.2s ${p.delay}ms cubic-bezier(0.23,1,0.32,1) forwards`,
          }}
        />
      ))}
    </div>
  );
}
