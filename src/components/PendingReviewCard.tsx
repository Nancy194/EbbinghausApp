import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TodayReviewItem } from '../types';
import { COLORS } from '../constants';
import { formatDisplayDate } from '../utils/dateUtils';

interface Props {
  item: TodayReviewItem;
  onReview: (sourceDate: string) => void;
}

export function PendingReviewCard({ item, onReview }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, item.hasOverdue && styles.cardOverdue]}
      onPress={() => onReview(item.sourceDate)}
      activeOpacity={0.7}
    >
      <View style={[styles.statusDot, { backgroundColor: item.hasOverdue ? COLORS.danger : COLORS.warning }]} />
      <View style={styles.middleSection}>
        <Text style={styles.dateText}>{formatDisplayDate(item.sourceDate)}</Text>
        <Text style={styles.detailText}>
          {item.entries.length} 条内容 · 第{item.pendingIntervals.join('/')}次复习
        </Text>
        {item.hasOverdue && (
          <Text style={styles.overdueText}>逾期 {item.overdueDays} 天</Text>
        )}
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.reviewButton}>复习 →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  cardOverdue: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
    backgroundColor: COLORS.dangerBg,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  middleSection: {
    flex: 1,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  overdueText: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '500',
    marginTop: 4,
  },
  rightSection: {
    justifyContent: 'center',
  },
  reviewButton: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
