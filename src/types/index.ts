export interface Entry {
  id: string;
  title: string;
  body: string;
}

export interface DayRecord {
  date: string;
  entries: Entry[];
  updatedAt: string;
}

export interface ReviewCompletion {
  interval: number;
  completedDate: string;
}

export interface PersistedData {
  dayRecords: Record<string, DayRecord>;
  completions: Record<string, ReviewCompletion[]>;
}

export interface ReviewStatus {
  completed: ReviewCompletion[];
  pending: { interval: number; scheduledDate: string }[];
  overdue: { interval: number; scheduledDate: string; overdueDays: number }[];
}

export interface TodayReviewItem {
  sourceDate: string;
  entries: Entry[];
  pendingIntervals: number[];
  hasOverdue: boolean;
  overdueDays: number;
}

export interface DailyReviewResult {
  items: TodayReviewItem[];
  total: number;
}

export interface AppState {
  nickname: string | null;
  dayRecords: Record<string, DayRecord>;
  completions: Record<string, ReviewCompletion[]>;
  selectedDate: string;
  today: string;
  isLoading: boolean;
  error: string | null;
  isSyncing: boolean;
  reviewLimit: number;
}
