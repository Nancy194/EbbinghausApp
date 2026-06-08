export interface Entry {
  id: string;
  title: string;
  body: string;
}

export interface ReviewCompletion {
  interval: number;
  completedDate: string;
}

export interface PersistedData {
  dayRecords: Record<string, { date: string; entries: Entry[]; updatedAt: string }>;
  completions: Record<string, ReviewCompletion[]>;
}
