import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
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
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const recordingRef = useRef(false);

  const handleTitleChange = (text: string) => {
    setTitle(text);
    const valid = text.trim().length > 0;
    onValidate(valid);
    onChange({ title: text, body });
  };

  const handleBodyChange = (text: string) => {
    setBody(text);
    setTranscript('');
    setErrorMsg('');
    onChange({ title, body: text });
  };

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results.length > 0) {
      const text = event.results[0]?.transcript ?? '';
      setTranscript(text);
      setErrorMsg('');
      if (event.isFinal) {
        const newBody = body ? `${body} ${text}` : text;
        setBody(newBody);
        setTranscript('');
        onChange({ title, body: newBody });
        setIsRecording(false);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsRecording(false);
    recordingRef.current = false;
    setErrorMsg(event.message || '语音识别出错');
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
    recordingRef.current = false;
  });

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      recordingRef.current = false;
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    setErrorMsg('');

    try {
      const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
      if (!available) {
        Alert.alert('不支持', '此设备不支持语音识别，可能缺少 Google 语音服务');
        return;
      }
    } catch {
      // isRecognitionAvailable might not exist on all platforms
    }

    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setErrorMsg('未获得麦克风权限');
      return;
    }

    recordingRef.current = true;
    setIsRecording(true);
    ExpoSpeechRecognitionModule.start({
      lang: 'zh-CN',
      interimResults: true,
    });
  }, [isRecording, body, title]);

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
      <View style={styles.bodyWrapper}>
        <TextInput
          style={styles.bodyInput}
          value={body + (transcript ? (body ? ' ' : '') + transcript : '')}
          onChangeText={handleBodyChange}
          placeholder="输入内容或使用语音..."
          placeholderTextColor={COLORS.textTertiary}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={toggleRecording}
          activeOpacity={0.7}
        >
          {isRecording ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.micIcon}>🎤</Text>
          )}
        </TouchableOpacity>
      </View>
      {isRecording && (
        <Text style={styles.recordingHint}>正在聆听中...</Text>
      )}
      {errorMsg ? (
        <Text style={styles.errorHint}>{errorMsg}</Text>
      ) : null}
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
  bodyWrapper: {
    position: 'relative',
  },
  bodyInput: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    paddingRight: 52,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.card,
    minHeight: 160,
  },
  micButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: COLORS.danger,
  },
  micIcon: {
    fontSize: 18,
  },
  recordingHint: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 6,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 12,
    color: COLORS.warning,
    marginTop: 6,
    textAlign: 'center',
  },
});
