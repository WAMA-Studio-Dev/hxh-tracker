import type { Season } from "./types";

export const TOTAL_EPISODES = 148;

export const SEASONS: Season[] = [
  {
    id: 1,
    title: "Examen de Cazador",
    subtitle: "y Familia Zoldyck",
    start: 1,
    end: 26,
    color: "#10b981",
    colorSoft: "rgba(16, 185, 129, 0.16)",
  },
  {
    id: 2,
    title: "Torre del Cielo",
    subtitle: "Heaven's Arena",
    start: 27,
    end: 36,
    color: "#f59e0b",
    colorSoft: "rgba(245, 158, 11, 0.16)",
  },
  {
    id: 3,
    title: "Ciudad Yorkshin",
    subtitle: "Subasta de la Mafia",
    start: 37,
    end: 58,
    color: "#8b5cf6",
    colorSoft: "rgba(139, 92, 246, 0.16)",
  },
  {
    id: 4,
    title: "Greed Island",
    subtitle: "El juego prohibido",
    start: 59,
    end: 75,
    color: "#3b82f6",
    colorSoft: "rgba(59, 130, 246, 0.16)",
  },
  {
    id: 5,
    title: "Hormigas Quimera",
    subtitle: "Chimera Ant",
    start: 76,
    end: 136,
    color: "#ef4444",
    colorSoft: "rgba(239, 68, 68, 0.16)",
  },
  {
    id: 6,
    title: "13.º Presidente",
    subtitle: "Elección de los Cazadores",
    start: 137,
    end: 148,
    color: "#6366f1",
    colorSoft: "rgba(99, 102, 241, 0.16)",
  },
];

export function seasonForEpisode(episode: number): Season | null {
  if (episode <= 0) return null;
  const match = SEASONS.find((s) => episode >= s.start && episode <= s.end);
  if (match) return match;
  return episode > TOTAL_EPISODES ? (SEASONS[SEASONS.length - 1] ?? null) : null;
}

export function episodeCount(season: Season): number {
  return season.end - season.start + 1;
}

export function episodesWatchedInSeason(season: Season, currentEpisode: number): number {
  if (currentEpisode < season.start) return 0;
  if (currentEpisode > season.end) return episodeCount(season);
  return currentEpisode - season.start + 1;
}

export function isSeasonComplete(season: Season, currentEpisode: number): boolean {
  return currentEpisode >= season.end;
}
