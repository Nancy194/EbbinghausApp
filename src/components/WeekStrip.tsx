import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { DayRecord, ReviewCompletion } from '../types';
import { COLORS } from '../constants';
import { formatDate, addDays, getToday, isBefore } from '../utils/dateUtils';
import { getReviewStatus } from '../utils/reviewAlgorithm';

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

interface Props {
  selectedDate: string;
  dayRecords: Record<string, DayRecord>;
  completions: Record<string, ReviewCompletion[]>;
  onSelectDate: (date: string) => void;
}

export function WeekStrip({
  selectedDate,
  dayRecords,
  completions,
  onSelectDate,
}: Props) {
  const today = getToday();

  const weekStart = useMemo(() => {
    const d = new Date(
      parseInt(selectedDate.slice(0, 4)),
      parseInt(selectedDate.slice(5, 7)) - 1,
      parseInt(selectedDate.slice(8, 10))
    );
    const dayOfWeek = d.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    d.setDate(d.getDate() + mondayOffset);
    return formatDate(d);
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);

  const dateStatuses = useMemo(() => {
    const statuses: Record<string, { color: string } | null> = {};

    for (const dateStr of weekDays) {
      if (dayRecords[dateStr]) {
        const status = getReviewStatus(dateStr, today, completions[dateStr] ?? []);
        if (status.overdue.length > 0) {
          statuses[dateStr] = { color: COLORS.danger };
        } else if (status.pending.length > 0) {
          statuses[dateStr] = { color: COLORS.warning };
        } else if (status.completed.length === 6) {
          statuses[dateStr] = { color: COLORS.primary };
        } else {
          statuses[dateStr] = { color: COLORS.textTertiary };
        }
      } else {
        let hasReview = false;
        for (const sourceDate of Object.keys(dayRecords)) {
          const status = getReviewStatus(sourceDate, today, completions[sourceDate] ?? []);
          for (const item of [...status.overdue, ...status.pending]) {
            if (item.scheduledDate === dateStr || (isBefore(item.scheduledDate, dateStr) && dateStr === today)) {
              hasReview = true;
              break;
            }
          }
          if (hasReview) break;
        }
        if (hasReview) {
          statuses[dateStr] = { color: COLORS.warning };
        }
      }
    }

    return statuses;
  }, [weekDays, dayRecords, completions, today]);

  const goPrevWeek = () => {
    onSelectDate(addDays(weekStart, -7));
  };

  const goNextWeek = () => {
    onSelectDate(addDays(weekStart, 7));
  };

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={goPrevWeek} style={styles.arrowBtn}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.weekLabel}>
          {weekStart} — {weekDays[6]}
        </Text>

        <TouchableOpacity onPress={goNextWeek} style={styles.arrowBtn}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daysRow}>
        {weekDays.map((dateStr, idx) => {
          const dayNum = parseInt(dateStr.slice(8, 10));
          const isSelected = dateStr === selectedDate;
          const isTodayDate = dateStr === today;
          const dot = dateStatuses[dateStr];

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
              ]}
              onPress={() => onSelectDate(dateStr)}
            >
              <Text style={[
                styles.weekdayLabel,
                isSelected && styles.weekdayLabelSelected,
              ]}>
                {WEEKDAY_LABELS[idx]}
              </Text>
              <View style={[
                styles.dayNumWrap,
                isTodayDate && !isSelected && styles.dayNumToday,
              ]}>
                <Text
                  style={[
                    styles.dayNum,
                    isSelected && styles.dayNumSelected,
                    isTodayDate && !isSelected && styles.dayNumTodayText,
                  ]}
                >
                  {dayNum}
                </Text>
              </View>
              {dot && (
                <View style={[styles.dot, { backgroundColor: dot.color }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  arrowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  arrowText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: '300',
  },
  weekLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayCell: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
    width: 44,
  },
  dayCellSelected: {
    backgroundColor: COLORS.primaryDark,
  },
  weekdayLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginBottom: 4,
    fontWeight: '400',
  },
  weekdayLabelSelected: {
    color: COLORS.textSecondary,
  },
  dayNumWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumToday: {
    borderWidth: 1.5,
    borderColor: COLORS.primaryDark,
  },
  dayNum: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  dayNumSelected: {
    color: COLORS.white,
  },
  dayNumTodayText: {
    color: COLORS.primaryDark,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
});
