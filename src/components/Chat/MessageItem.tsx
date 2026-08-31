import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../theme/colors';
import TypingIndicator from '../TypingIndicator';
import { images } from '../../assets';

export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  action?: {
    label: string;
    screen: string;
    params?: Record<string, any>;
  };
}

interface MessageItemProps {
  item: Message;
  onAction?: (action: Message['action']) => void;
}

const MessageItem = memo(({ item, onAction }: MessageItemProps) => {
  const isUser = item.role === 'user';

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowBot]}>
      {!isUser && <Image source={images.mori} style={styles.botAvatar} />}
      <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapBot]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          {item.text === '...' ? (
            <TypingIndicator />
          ) : (
            <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
              {item.text}
            </Text>
          )}
        </View>
        {item.action && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onAction?.(item.action)}
            activeOpacity={0.7}>
            <Text style={styles.actionBtnText}>{item.action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowBot: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  bubbleWrap: {
    maxWidth: '78%',
  },
  bubbleWrapUser: {
    alignItems: 'flex-end',
  },
  bubbleWrapBot: {
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: colors.white,
  },
  bubbleTextBot: {
    color: colors.text,
  },
  actionBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

export default MessageItem;
