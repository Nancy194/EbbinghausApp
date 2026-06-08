import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TodayReviewItem } from '../types';
import { COLORS } from '../constants';
import { PendingReviewCard } from './PendingReviewCard';

interface Props {
  items: TodayReviewItem[];
  onReview: (sourceDate: string) => void;
}

export function PendingReviewList({ items, onReview }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>待复习 ({items.length})</Text>
      {items.map((item) => (
        <PendingReviewCard
          key={item.sourceDate}
          item={item}
          onReview={onReview}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
});
