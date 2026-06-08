import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { COLORS } from '../constants';
import { formatDisplayDate, isToday } from '../utils/dateUtils';
import { getTodayReviews } from '../utils/reviewAlgorithm';
import { WeekStrip } from '../components/WeekStrip';
import { PendingReviewList } from '../components/PendingReviewList';
import { DayContentList } from '../components/DayContentList';
import { SettingsModal } from '../components/SettingsModal';
import type { Entry } from '../types';

export function HomeScreen({ navigation }: any) {
  const {
    state,
    logout,
    setReviewLimit,
    selectDate,
    markReviewComplete,
    deleteEntry,
  } = useAppContext();

  const {
    nickname,
    dayRecords,
    completions,
    selectedDate,
    today,
    isLoading,
    error,
    reviewLimit,
  } = state;

  const [settingsVisible, setSettingsVisible] = useState(false);
  const dateIsToday = isToday(selectedDate);

  const reviewResult = useMemo(
    () => getTodayReviews(selectedDate, dayRecords, completions, reviewLimit),
    [dayRecords, completions, selectedDate, reviewLimit]
  );

  const currentEntries = dayRecords[selectedDate]?.entries ?? [];
  const overLimit = reviewResult.total - reviewResult.items.length;

  const handleAddEntry = () => {
    navigation.navigate('ContentForm', { date: selectedDate });
  };

  const handleEditEntry = (entry: Entry) => {
    navigation.navigate('ContentForm', {
      date: selectedDate,
      entryId: entry.id,
      title: entry.title,
      body: entry.body,
    });
  };

  const handleDeleteEntry = (entry: Entry) => {
    deleteEntry(selectedDate, entry.id);
  };

  const handleReview = (sourceDate: string) => {
    navigation.navigate('Review', { sourceDate });
  };

  const handleRefresh = () => {
    selectDate(selectedDate);
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出当前账号吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>加载失败</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.nickname} numberOfLines={1}>{nickname}</Text>
          <TouchableOpacity onPress={() => setSettingsVisible(true)}>
            <Text style={styles.settingsText}>设置</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>退出</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>艾宾浩斯记忆</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        <WeekStrip
          selectedDate={selectedDate}
          dayRecords={dayRecords}
          completions={completions}
          onSelectDate={selectDate}
        />

        <Text style={styles.dateLabel}>
          {formatDisplayDate(selectedDate)}
        </Text>

        {dateIsToday && reviewResult.items.length > 0 && (
          <PendingReviewList items={reviewResult.items} onReview={handleReview} />
        )}

        {dateIsToday && overLimit > 0 && (
          <View style={styles.limitNotice}>
            <Text style={styles.limitNoticeText}>
              今日已达上限（{reviewLimit} 组），剩余 {overLimit} 组顺延至明日
            </Text>
          </View>
        )}

        {dateIsToday &&
          reviewResult.total === 0 &&
          Object.keys(dayRecords).length > 0 && (
            <View style={styles.allCaughtUp}>
              <Text style={styles.allCaughtUpText}>全部复习已完成</Text>
            </View>
          )}

        {!dateIsToday && reviewResult.total > 0 && (
          <View style={styles.reviewNotice}>
            <Text style={styles.reviewNoticeText}>
              该日期有 {reviewResult.total} 组内容需要复习
            </Text>
          </View>
        )}

        <DayContentList
          entries={currentEntries}
          onAdd={handleAddEntry}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      </ScrollView>

      <SettingsModal
        visible={settingsVisible}
        reviewLimit={reviewLimit}
        onClose={() => setSettingsVisible(false)}
        onChangeLimit={setReviewLimit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerRight: {
    flex: 1,
  },
  nickname: {
    fontSize: 11,
    color: COLORS.textTertiary,
    maxWidth: 80,
  },
  settingsText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  logoutText: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger,
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  allCaughtUp: {
    backgroundColor: COLORS.bannerBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    alignItems: 'center',
  },
  allCaughtUpText: {
    fontSize: 13,
    color: COLORS.bannerText,
    fontWeight: '600',
  },
  reviewNotice: {
    backgroundColor: COLORS.warningBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  reviewNoticeText: {
    fontSize: 13,
    color: COLORS.warning,
  },
  limitNotice: {
    backgroundColor: COLORS.bannerBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  limitNoticeText: {
    fontSize: 13,
    color: COLORS.bannerText,
    textAlign: 'center',
  },
});
