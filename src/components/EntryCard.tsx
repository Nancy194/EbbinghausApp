import React from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet, Alert } from 'react-native';
import type { Entry } from '../types';
import { COLORS } from '../constants';

interface Props {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
  readonly?: boolean;
  index?: number;
  total?: number;
}

export function EntryCard({ entry, onEdit, onDelete, readonly, index, total }: Props) {
  const handleLongPress = () => {
    if (readonly) return;
    Alert.alert('操作', '请选择操作', [
      { text: '编辑', onPress: () => onEdit(entry) },
      { text: '删除', style: 'destructive', onPress: () => confirmDelete() },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert('确认删除', `确定要删除「${entry.title}」吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => onDelete(entry) },
    ]);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && !readonly && styles.cardPressed,
      ]}
      onLongPress={handleLongPress}
    >
      {index !== undefined && total !== undefined && (
        <Text style={styles.counter}>
          {index}/{total}
        </Text>
      )}
      <Text style={styles.title}>{entry.title}</Text>
      {entry.body ? <Text style={styles.body}>{entry.body}</Text> : null}
      {!readonly && (
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onEdit(entry)}
            style={styles.editButton}
          >
            <Text style={styles.editText}>编辑</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmDelete}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>删除</Text>
          </TouchableOpacity>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  cardPressed: {
    opacity: 0.7,
  },
  counter: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  body: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 16,
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editText: {
    color: COLORS.primary,
    fontSize: 13,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteText: {
    color: COLORS.danger,
    fontSize: 13,
  },
});
