import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface Props {
  initialTitle?: string;
  initialBody?: string;
  onValidate: (valid: boolean) => void;
  onChange: (data: { title: string; body: string }) => void;
}

export function EntryForm({ initialTitle = '', initialBody = '', onValidate, onChange }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  const handleTitleChange = (text: string) => {
    setTitle(text);
    const valid = text.trim().length > 0;
    onValidate(valid);
    onChange({ title: text, body });
  };

  const handleBodyChange = (text: string) => {
    setBody(text);
    onChange({ title, body: text });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>标题 *</Text>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={handleTitleChange}
        placeholder="输入标题..."
        placeholderTextColor={COLORS.textTertiary}
        autoFocus={!initialTitle}
      />
      <Text style={styles.label}>正文</Text>
      <TextInput
        style={styles.bodyInput}
        value={body}
        onChangeText={handleBodyChange}
        placeholder="输入内容..."
        placeholderTextColor={COLORS.textTertiary}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 12,
  },
  titleInput: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.card,
  },
  bodyInput: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.card,
    minHeight: 160,
  },
});
