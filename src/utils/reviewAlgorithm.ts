import { EBBINGHAUS_INTERVALS } from '../constants';
import type { DayRecord, DailyReviewResult, ReviewCompletion, ReviewStatus, TodayReviewItem } from '../types';
import { addDays, daysBetween } from './dateUtils';

export function getReviewStatus(
  sourceDate: string,
  today: string,
  completions: ReviewCompletion[]
): ReviewStatus {
  const completedSet = new Set(completions.map((c) => c.interval));
  const completed: ReviewCompletion[] = completions.map((c) => ({ ...c }));

  const pending: { interval: number; scheduledDate: string }[] = [];
  const overdue: { interval: number; scheduledDate: string; overdueDays: number }[] = [];

  let baseDate = sourceDate;
  // 找到最后一个完成的复习日期作为基准
  if (completions.length > 0) {
    const lastCompleted = completions.reduce((latest, c) =>
      c.completedDate > latest.completedDate ? c : latest
    );
    baseDate = lastCompleted.completedDate;
  }

  for (const interval of EBBINGHAUS_INTERVALS) {
    if (completedSet.has(interval)) continue;

    // 找到上一个已完成的 interval（或者0=学习日期）
    const prevInterval = findPrevCompletedInterval(interval, completedSet);
    const refDate = prevInterval === 0
      ? sourceDate
      : completions.find((c) => c.interval === prevInterval)!.completedDate;

    const scheduledDate = addDays(refDate, interval - prevInterval);

    if (scheduledDate < today) {
      overdue.push({
        interval,
        scheduledDate,
        overdueDays: daysBetween(scheduledDate, today),
      });
    } else {
      pending.push({ interval, scheduledDate });
    }
  }

  return { completed, pending, overdue };
}

function findPrevCompletedInterval(
  target: number,
  completedSet: Set<number>
): number {
  let prev = 0;
  for (const interval of EBBINGHAUS_INTERVALS) {
    if (interval >= target) break;
    if (completedSet.has(interval)) {
      prev = interval;
    }
  }
  return prev;
}

export function getTodayReviews(
  today: string,
  dayRecords: Record<string, DayRecord>,
  completions: Record<string, ReviewCompletion[]>,
  limit: number
): DailyReviewResult {
  const all: TodayReviewItem[] = [];

  for (const [sourceDate, record] of Object.entries(dayRecords)) {
    if (sourceDate > today) continue;
    if (record.entries.length === 0) continue;

    const sourceCompletions = completions[sourceDate] ?? [];
    const completedSet = new Set(sourceCompletions.map((c) => c.interval));

    const pendingIntervals: number[] = [];
    let hasOverdue = false;
    let maxOverdueDays = 0;

    let baseDate = sourceDate;
    if (sourceCompletions.length > 0) {
      const lastCompleted = sourceCompletions.reduce((latest, c) =>
        c.completedDate > latest.completedDate ? c : latest
      );
      baseDate = lastCompleted.completedDate;
    }

    for (const interval of EBBINGHAUS_INTERVALS) {
      if (completedSet.has(interval)) continue;

      const prevInterval = findPrevCompletedInterval(interval, completedSet);
      const refDate = prevInterval === 0
        ? sourceDate
        : sourceCompletions.find((c) => c.interval === prevInterval)!.completedDate;

      const scheduledDate = addDays(refDate, interval - prevInterval);

      if (scheduledDate <= today) {
        pendingIntervals.push(interval);
        if (scheduledDate < today) {
          hasOverdue = true;
          const overdueDays = daysBetween(scheduledDate, today);
          if (overdueDays > maxOverdueDays) maxOverdueDays = overdueDays;
        }
      }
    }

    if (pendingIntervals.length > 0) {
      all.push({
        sourceDate,
        entries: record.entries,
        pendingIntervals,
        hasOverdue,
        overdueDays: maxOverdueDays,
      });
    }
  }

  // 优先级排序：逾期天数多 > 逾期天数少 > 今日到期，同等按 sourceDate
  all.sort((a, b) => {
    const aIsOverdue = a.hasOverdue ? a.overdueDays : 0;
    const bIsOverdue = b.hasOverdue ? b.overdueDays : 0;
    if (aIsOverdue !== bIsOverdue) return bIsOverdue - aIsOverdue;
    return a.sourceDate.localeCompare(b.sourceDate);
  });

  const total = all.length;
  const items = all.slice(0, limit);

  return { items, total };
}

export function markReviewComplete(
  sourceDate: string,
  reviewDate: string,
  completions: Record<string, ReviewCompletion[]>
): Record<string, ReviewCompletion[]> {
  const updated: Record<string, ReviewCompletion[]> = {};

  for (const key of Object.keys(completions)) {
    updated[key] = completions[key].map((c) => ({ ...c }));
  }

  const sourceCompletions = updated[sourceDate] ?? [];
  const completedSet = new Set(sourceCompletions.map((c) => c.interval));

  let baseDate = sourceDate;
  if (sourceCompletions.length > 0) {
    const lastCompleted = sourceCompletions.reduce((latest, c) =>
      c.completedDate > latest.completedDate ? c : latest
    );
    baseDate = lastCompleted.completedDate;
  }

  for (const interval of EBBINGHAUS_INTERVALS) {
    if (completedSet.has(interval)) continue;

    const prevInterval = findPrevCompletedInterval(interval, completedSet);
    const refDate = prevInterval === 0
      ? sourceDate
      : sourceCompletions.find((c) => c.interval === prevInterval)!.completedDate;

    const scheduledDate = addDays(refDate, interval - prevInterval);

    if (scheduledDate <= reviewDate) {
      sourceCompletions.push({ interval, completedDate: reviewDate });
      completedSet.add(interval);
    }
  }

  updated[sourceDate] = sourceCompletions;
  return updated;
}

export function getReviewDatesForSourceDate(
  sourceDate: string,
  completions: ReviewCompletion[]
): { interval: number; scheduledDate: string; completed: boolean; completedDate?: string }[] {
  const completedMap = new Map(completions.map((c) => [c.interval, c.completedDate]));

  let baseDate = sourceDate;
  if (completions.length > 0) {
    const lastCompleted = completions.reduce((latest, c) =>
      c.completedDate > latest.completedDate ? c : latest
    );
    baseDate = lastCompleted.completedDate;
  }

  const result: { interval: number; scheduledDate: string; completed: boolean; completedDate?: string }[] = [];
  const completedSet = new Set(completions.map((c) => c.interval));

  for (const interval of EBBINGHAUS_INTERVALS) {
    const prevInterval = findPrevCompletedInterval(interval, completedSet);
    const refDate = prevInterval === 0
      ? sourceDate
      : completions.find((c) => c.interval === prevInterval)!.completedDate;

    result.push({
      interval,
      scheduledDate: addDays(refDate, interval - prevInterval),
      completed: completedSet.has(interval),
      completedDate: completedMap.get(interval),
    });
  }

  return result;
}

export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 16; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${Date.now()}-${id}`;
}
