export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function daysBetween(from: string, to: string): number {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  return Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date());
}

export function getToday(): string {
  return formatDate(new Date());
}

export function isBefore(dateStr1: string, dateStr2: string): boolean {
  return dateStr1 < dateStr2;
}

export function isAfter(dateStr1: string, dateStr2: string): boolean {
  return dateStr1 > dateStr2;
}

export function formatDisplayDate(dateStr: string): string {
  const d = parseDate(dateStr);
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`;
}
