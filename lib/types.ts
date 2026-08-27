export type HistoryEntry = {
  /** ISO timestamp of when the episode value was set */
  date: string;
  episode: number;
};

export type RewatchEntry = {
  id: string;
  startedAt: string;
  completedAt: string;
  finalEpisode: number;
  history: HistoryEntry[];
};

export type Progress = {
  syncId: string;
  currentEpisode: number;
  targetPace: number;
  history: HistoryEntry[];
  rewatches: RewatchEntry[];
  updatedAt: string;
};

export type Season = {
  id: number;
  title: string;
  subtitle: string;
  start: number;
  end: number;
  color: string;
  colorSoft: string;
};
