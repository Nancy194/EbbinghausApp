import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { recognizeSpeech } from '../services/speechToText';
import { COLORS } from '../constants';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
  const [errorMsg, setErrorMsg] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const webRecognition = useRef<any>(null);

  const handleTitleChange = (text: string) => {
    setTitle(text);
    const valid = text.trim().length > 0;
    onValidate(valid);
    onChange({ title: text, body });
  };

  const handleBodyChange = (text: string) => {
    setBody(text);
    setErrorMsg('');
    onChange({ title, body: text });
  };

  // ---- Web: 使用浏览器 SpeechRecognition API ----
  const startWebRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('浏览器不支持语音识别，请使用 Chrome');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const text = event.results[0]?.[0]?.transcript ?? '';
      if (event.results[0].isFinal) {
        const newBody = body ? `${body} ${text}` : text;
        setBody(newBody);
        onChange({ title, body: newBody });
        setIsRecording(false);
      }
    };

    recognition.onerror = (event: any) => {
      setErrorMsg(event.error || '语音识别失败');
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    webRecognition.current = recognition;
    recognition.start();
    setIsRecording(true);
    setErrorMsg('');
  }, [body, title, onChange]);

  const stopWebRecognition = useCallback(() => {
    webRecognition.current?.stop();
    webRecognition.current = null;
    setIsRecording(false);
  }, []);

  // ---- Native: 录音 + 百度语音识别 ----
  const startNativeRecording = useCallback(async () => {
    setErrorMsg('');

    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setErrorMsg('未获得麦克风权限');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || '启动录音失败');
    }
  }, []);

  const stopNativeRecording = useCallback(async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      setRecording(null);
      setIsRecording(false);

      const uri = recording.getURI();
      if (!uri) {
        setErrorMsg('录音文件读取失败');
        return;
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        setErrorMsg('录音文件不存在');
        return;
      }

      const text = await recognizeSpeech(base64, fileInfo.size ?? 0);

      if (text) {
        const newBody = body ? `${body} ${text}` : text;
        setBody(newBody);
        onChange({ title, body: newBody });
      }
    } catch (err: any) {
      setErrorMsg(err.message || '语音识别失败');
    }
  }, [recording, body, title, onChange]);

  const handleMicPress = useCallback(() => {
    if (Platform.OS === 'web') {
      if (isRecording) {
        stopWebRecognition();
      } else {
        startWebRecognition();
      }
    } else {
      if (isRecording) {
        stopNativeRecording();
      } else {
        startNativeRecording();
      }
    }
  }, [isRecording, startWebRecognition, stopWebRecognition, startNativeRecording, stopNativeRecording]);

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
          value={body}
          onChangeText={handleBodyChange}
          placeholder="输入内容或使用语音..."
          placeholderTextColor={COLORS.textTertiary}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={handleMicPress}
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
        <Text style={styles.recordingHint}>正在聆听中，点击停止识别...</Text>
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
