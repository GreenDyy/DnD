import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Send, Square } from 'lucide-react-native';
import { Input } from '../Common';
import { colors } from '../../theme/colors';

interface ChatInputProps {
  input: string;
  isReady: boolean;
  isGenerating: boolean;
  isLoading: boolean;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onStop?: () => void;
  maxLength?: number;
}

function ChatInput({
  input,
  isReady,
  isGenerating,
  isLoading,
  onChangeText,
  onSend,
  onStop,
  maxLength = 200,
}: ChatInputProps) {
  const canSend = input.trim() && !isGenerating && !isLoading;

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Input
          value={input}
          onChangeText={onChangeText}
          placeholder={isReady ? 'Nhập câu hỏi của bạn...' : 'Đang tải model...'}
          editable={!isGenerating && !isLoading}
          onSubmitEditing={onSend}
          maxLength={maxLength}
          returnKeyType="send"
          containerStyle={styles.input}
        />
        {isGenerating ? (
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={onStop}
            activeOpacity={0.7}>
            <Square size={16} color={colors.white} fill={colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
            onPress={onSend}
            disabled={!canSend}>
            <Send size={18} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  stopBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatInput;
