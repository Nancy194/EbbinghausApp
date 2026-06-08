import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS } from '../constants';

interface Props {
  visible: boolean;
  reviewLimit: number;
  onClose: () => void;
  onChangeLimit: (limit: number) => void;
}

export function SettingsModal({
  visible,
  reviewLimit,
  onClose,
  onChangeLimit,
}: Props) {
  const decrement = () => {
    if (reviewLimit > 1) onChangeLimit(reviewLimit - 1);
  };

  const increment = () => {
    if (reviewLimit < 50) onChangeLimit(reviewLimit + 1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={styles.title}>每日复习上限</Text>
        <Text style={styles.desc}>
          超过上限的复习内容将顺延至明日
        </Text>

        <View style={styles.stepper}>
          <TouchableOpacity
            style={[styles.stepBtn, reviewLimit <= 1 && styles.stepBtnDisabled]}
            onPress={decrement}
            disabled={reviewLimit <= 1}
          >
            <Text style={[styles.stepBtnText, reviewLimit <= 1 && styles.stepBtnTextDisabled]}>−</Text>
          </TouchableOpacity>

          <Text style={styles.limitValue}>{reviewLimit}</Text>

          <TouchableOpacity
            style={[styles.stepBtn, reviewLimit >= 50 && styles.stepBtnDisabled]}
            onPress={increment}
            disabled={reviewLimit >= 50}
          >
            <Text style={[styles.stepBtnText, reviewLimit >= 50 && styles.stepBtnTextDisabled]}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>完成</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: COLORS.border,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textTertiary,
    marginBottom: 24,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 28,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.headerBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  stepBtnDisabled: {
    opacity: 0.3,
  },
  stepBtnText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: '500',
  },
  stepBtnTextDisabled: {
    color: COLORS.textTertiary,
  },
  limitValue: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 48,
    textAlign: 'center',
  },
  closeBtn: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  closeBtnText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '600',
  },
});
