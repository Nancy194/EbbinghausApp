import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import {
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  AudioQuality,
} from 'expo-audio';
import { recognizeSpeech } from '../services/speechToText';
import { COLORS } from '../constants';
import type { RecordingOptions } from 'expo-audio';

// 百度ASR支持的录音格式
const RECORDING_OPTIONS: RecordingOptions = {
  extension: '.amr',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 12200,
  android: {
    outputFormat: 'amrwb',
    audioEncoder: 'amr_wb',
  },
  ios: {
    outputFormat: 'linearPCM',
    audioQuality: AudioQuality.MAX,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 256000,
  },
};

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

  const audioRecorder = useAudioRecorder(RECORDING_OPTIONS);

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

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      try {
        await audioRecorder.stop();
        setIsRecording(false);
      } catch {
        setIsRecording(false);
        setErrorMsg('停止录音失败');
      }
      return;
    }

    setErrorMsg('');

    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setErrorMsg('未获得麦克风权限');
        return;
      }

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (err: any) {
      setErrorMsg(err.message || '启动录音失败');
    }
  }, [isRecording, audioRecorder]);

  const stopAndRecognize = useCallback(async () => {
    if (!isRecording) return;

    try {
      await audioRecorder.stop();
      setIsRecording(false);

      const uri = audioRecorder.uri;
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
  }, [isRecording, audioRecorder, body, title, onChange]);

  const handleMicPress = useCallback(() => {
    if (isRecording) {
      stopAndRecognize();
    } else {
      toggleRecording();
    }
  }, [isRecording, toggleRecording, stopAndRecognize]);

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
