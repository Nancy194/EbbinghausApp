import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';

interface Props {
  onLogin: (nickname: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function AuthScreen({ onLogin, loading, error }: Props) {
  const [nickname, setNickname] = useState('');

  const trimmed = nickname.trim().toLowerCase();
  const isValid = trimmed.length >= 2 && trimmed.length <= 20
    && /^[a-z0-9_一-鿿]+$/.test(trimmed);

  const handleEnter = () => {
    if (!isValid || loading) return;
    onLogin(trimmed);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>艾宾浩斯记忆</Text>
          <Text style={styles.subtitle}>输入昵称开始使用</Text>

          <TextInput
            style={styles.input}
            placeholder="你的昵称"
            placeholderTextColor={COLORS.textTertiary}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            editable={!loading}
            returnKeyType="go"
            onSubmitEditing={handleEnter}
          />

          <Text style={styles.hint}>
            2-20 个字符，支持中英文、数字、下划线
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, (!isValid || loading) && styles.buttonDisabled]}
            onPress={handleEnter}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>进入</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  hint: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  error: {
    fontSize: 13,
    color: COLORS.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
