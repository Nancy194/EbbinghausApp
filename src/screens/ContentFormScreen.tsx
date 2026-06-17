import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { COLORS } from '../constants';
import { generateId } from '../utils/reviewAlgorithm';
import { isToday } from '../utils/dateUtils';
import { EntryForm } from '../components/EntryForm';

export function ContentFormScreen({ route, navigation }: any) {
  const { date, entryId, title: initTitle, body: initBody } = route.params ?? {};
  const isEditing = !!entryId;
  const { addEntry, editEntry } = useAppContext();

  const [formData, setFormData] = useState({ title: initTitle ?? '', body: initBody ?? '' });
  const [isValid, setIsValid] = useState(isEditing);
  const [resetReview, setResetReview] = useState(!isToday(date));

  const dateIsPast = !isToday(date);

  const handleChange = useCallback(
    (data: { title: string; body: string }) => {
      setFormData(data);
    },
    []
  );

  const handleValidate = useCallback(
    (valid: boolean) => {
      setIsValid(valid);
    },
    []
  );

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert('提示', '请输入标题');
      return;
    }

    if (isEditing) {
      editEntry(date, entryId, formData.title.trim(), formData.body.trim());
    } else {
      const entry = {
        id: generateId(),
        title: formData.title.trim(),
        body: formData.body.trim(),
      };
      addEntry(date, entry, dateIsPast ? resetReview : undefined);
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? '编辑内容' : '添加内容'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isValid}
          style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
        >
          <Text
            style={[styles.saveButtonText, !isValid && styles.saveButtonTextDisabled]}
          >
            保存
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <EntryForm
          initialTitle={initTitle}
          initialBody={initBody}
          onValidate={handleValidate}
          onChange={handleChange}
        />

        {dateIsPast && (
          <View style={styles.reviewedToggle}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleLabel}>重置复习时钟</Text>
              <Text style={styles.toggleHint}>标记为"今日已复习"，明天开始按艾宾浩斯间隔复习</Text>
            </View>
            <Switch
              value={resetReview}
              onValueChange={setResetReview}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={resetReview ? COLORS.white : COLORS.textTertiary}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  cancelButton: {
    fontSize: 15,
    color: COLORS.textTertiary,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: COLORS.textTertiary,
  },
  reviewedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    marginTop: 8,
  },
  toggleText: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  toggleHint: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
});
