import type { HistoryEntry } from "./types";
import { addDays, daysBetween, formatSpanishDate } from "./date";

const REAL_PACE_WINDOW_DAYS = 14;
const MIN_ELAPSED_DAYS = 0.5;

/**
 * Real pace uses the oldest history entry within the trailing window (or the
 * oldest entry overall if the whole history is younger than the window) so a
 * single burst session doesn't produce a misleading "infinite" pace.
 */
export function computeRealPace(history: HistoryEntry[], now: Date = new Date()): number | null {
  if (history.length < 2) return null;

  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  if (!first || !latest) return null;

  const cutoff = addDays(now, -REAL_PACE_WINDOW_DAYS);

  let reference = first;
  for (const entry of sorted) {
    if (new Date(entry.date) <= cutoff) {
      reference = entry;
    } else {
      break;
    }
  }

  const elapsedDays = daysBetween(new Date(reference.date), new Date(latest.date));
  const episodesDelta = latest.episode - reference.episode;
  if (episodesDelta <= 0) return 0;
  // Below this spread, a single binge session would read as an absurd "48 episodes/day" pace.
  if (elapsedDays < MIN_ELAPSED_DAYS) return null;

  return episodesDelta / elapsedDays;
}

export function computeDaysRemaining(episodesRemaining: number, dailyPace: number): number {
  if (episodesRemaining <= 0) return 0;
  const safePace = Math.max(dailyPace, 0.1);
  return Math.ceil(episodesRemaining / safePace);
}

export function computeFinishDate(daysRemaining: number, now: Date = new Date()): string {
  if (daysRemaining <= 0) return "¡Ya la has terminado!";
  return formatSpanishDate(addDays(now, daysRemaining));
}
