import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { COLORS } from '../constants';
import { formatDisplayDate, daysBetween } from '../utils/dateUtils';
import { getReviewStatus } from '../utils/reviewAlgorithm';
import { EntryCard } from '../components/EntryCard';

export function ReviewScreen({ route, navigation }: any) {
  const { sourceDate } = route.params;
  const { state, markReviewComplete } = useAppContext();
  const { dayRecords, completions, today } = state;

  const [currentIndex, setCurrentIndex] = useState(0);

  const record = dayRecords[sourceDate];
  const sourceCompletions = completions[sourceDate] ?? [];
  const reviewStatus = getReviewStatus(sourceDate, today, sourceCompletions);
  const allPending = [...reviewStatus.overdue, ...reviewStatus.pending];

  const entries = record?.entries ?? [];
  const currentEntry = entries[currentIndex];

  const handleMarkReviewed = () => {
    markReviewComplete(sourceDate);
    Alert.alert('完成', '复习已标记完成', [
      { text: '返回首页', onPress: () => navigation.goBack() },
    ]);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < entries.length - 1) setCurrentIndex(currentIndex + 1);
  };

  if (!record || entries.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>复习</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>没有需要复习的内容</Text>
        </View>
      </SafeAreaView>
    );
  }

  const overdueDays =
    allPending.length > 0
      ? daysBetween(
          reviewStatus.pending[0]?.scheduledDate ??
            reviewStatus.overdue[0]?.scheduledDate,
          today
        )
      : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 返回</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            复习 {formatDisplayDate(sourceDate)}
          </Text>
          <Text style={styles.headerSubtitle}>
            {entries.length} 条内容
            {reviewStatus.overdue.length > 0 && ` · 逾期 ${overdueDays} 天`}
          </Text>
        </View>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {currentEntry && (
          <EntryCard
            entry={currentEntry}
            onEdit={() => {}}
            onDelete={() => {}}
            readonly
            index={currentIndex + 1}
            total={entries.length}
          />
        )}
      </ScrollView>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Text
            style={[
              styles.navButtonText,
              currentIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            ← 上一条
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          {currentIndex + 1} / {entries.length}
        </Text>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === entries.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={currentIndex === entries.length - 1}
        >
          <Text
            style={[
              styles.navButtonText,
              currentIndex === entries.length - 1 && styles.navButtonTextDisabled,
            ]}
          >
            下一条 →
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.markButton} onPress={handleMarkReviewed}>
          <Text style={styles.markButtonText}>标记为已复习</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: COLORS.textTertiary,
  },
  pageIndicator: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
  markButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  markButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
