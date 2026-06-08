import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Entry } from '../types';
import { COLORS } from '../constants';
import { EntryCard } from './EntryCard';
import { EmptyState } from './EmptyState';

interface Props {
  entries: Entry[];
  onAdd: () => void;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
}

export function DayContentList({ entries, onAdd, onEdit, onDelete }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>当天学习内容 ({entries.length})</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>+ 添加</Text>
        </TouchableOpacity>
      </View>

      {entries.length === 0 ? (
        <EmptyState
          message="还没有添加内容"
          actionLabel="添加第一条"
          onAction={onAdd}
        />
      ) : (
        entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
});
