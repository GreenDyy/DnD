import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Mic, Square } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface ChatInputProps {
  input: string;
  isReady: boolean;
  isGenerating: boolean;
  isLoading: boolean;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onStop?: () => void;
  onSpeechStart?: () => void;
  onSpeechStop?: () => void;
  isListening?: boolean;
  speechTranscript?: string;
  maxLength?: number;
}

const ICON_SIZE = 20;
const BUTTON_SIZE = 40;
const INPUT_HORIZONTAL_PADDING = 16;
const CONTAINER_HORIZONTAL_PADDING = 12;
const GAP = 8;

function ChatInput({
  input,
  isReady,
  isGenerating,
  isLoading,
  onChangeText,
  onSend,
  onStop,
  onSpeechStart,
  onSpeechStop,
  isListening = false,
  speechTranscript = '',
  maxLength = 200,
}: ChatInputProps) {
  const insets = useSafeAreaInsets();

  const canSend =
    input.trim().length > 0 &&
    !isGenerating &&
    !isLoading;

  // -----------------------------
  // Animations
  // -----------------------------

  const micScaleAnim = useRef(new Animated.Value(1)).current;
  const sendScaleAnim = useRef(new Animated.Value(1)).current;

  const pulseAnim = useRef(new Animated.Value(0)).current;

  // -----------------------------
  // Listening pulse
  // -----------------------------

  useEffect(() => {
    if (!isListening) {
      pulseAnim.stopAnimation();

      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();

      return;
    }

    pulseAnim.setValue(0);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [isListening, pulseAnim]);

  // -----------------------------
  // Mic listening scale
  // -----------------------------

  useEffect(() => {
    Animated.timing(micScaleAnim, {
      toValue: isListening ? 1.08 : 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isListening, micScaleAnim]);

  // -----------------------------
  // Press animation
  // -----------------------------

  const animatePress = useCallback(
    (
      animation: Animated.Value,
      pressed: boolean,
    ) => {
      Animated.timing(animation, {
        toValue: pressed ? 0.92 : 1,
        duration: pressed ? 80 : 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [],
  );

  // -----------------------------
  // Mic
  // -----------------------------

  const handleMicPress = useCallback(() => {
    if (isListening) {
      onSpeechStop?.();
    } else {
      onSpeechStart?.();
    }
  }, [
    isListening,
    onSpeechStart,
    onSpeechStop,
  ]);

  // -----------------------------
  // Send
  // -----------------------------

  const handleSendPress = useCallback(() => {
    if (!canSend) return;

    onSend();
  }, [canSend, onSend]);

  // -----------------------------
  // Animated values
  // -----------------------------

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.45],
  });

  const micBgColor = isListening
    ? `${colors.primary}18`
    : colors.surface;

  const showStopButton = isGenerating;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(
            12,
            insets.bottom + 8,
          ),
        },
      ]}
    >
      {/* Input + buttons */}
      <View style={styles.composer}>
        {/* Text Input */}
        <View
          style={[
            styles.inputWrapper,
            isListening && styles.inputWrapperListening,
          ]}
        >
          <TextInput
            value={speechTranscript || input}
            onChangeText={onChangeText}
            placeholder={
              isReady
                ? 'Nhập câu hỏi của bạn...'
                : 'Đang tải model...'
            }
            placeholderTextColor={colors.textSecondary}
            editable={
              !isGenerating &&
              !isLoading &&
              !isListening
            }
            onSubmitEditing={onSend}
            maxLength={maxLength}
            returnKeyType="send"
            style={styles.textInput}
            selectionColor={colors.primary}
            underlineColorAndroid="transparent"
            multiline={false}
          />
        </View>

        {/* Mic */}
        <Animated.View
          style={{
            transform: [
              {
                scale: micScaleAnim,
              },
            ],
          }}
        >
          <TouchableOpacity
            style={[
              styles.iconButton,
              {
                backgroundColor: micBgColor,
              },
            ]}
            onPress={handleMicPress}
            onPressIn={() =>
              animatePress(micScaleAnim, true)
            }
            onPressOut={() =>
              animatePress(
                micScaleAnim,
                false,
              )
            }
            activeOpacity={1}
            disabled={
              isGenerating ||
              isLoading
            }
            accessibilityLabel={
              isListening
                ? 'Đang nghe, nhấn để dừng'
                : 'Nhấn để nói'
            }
            accessibilityState={{
              selected: isListening,
            }}
          >
            {/* Pulse ring */}
            {isListening && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.pulseRing,
                  {
                    transform: [
                      {
                        scale: pulseScale,
                      },
                    ],
                    opacity: pulseOpacity,
                  },
                ]}
              />
            )}

            <Mic
              size={ICON_SIZE}
              color={
                isListening
                  ? colors.primary
                  : colors.textSecondary
              }
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Send / Stop */}
        {showStopButton ? (
          <Animated.View
            style={{
              transform: [
                {
                  scale: sendScaleAnim,
                },
              ],
            }}
          >
            <TouchableOpacity
              style={styles.sendButton}
              onPress={onStop}
              onPressIn={() =>
                animatePress(
                  sendScaleAnim,
                  true,
                )
              }
              onPressOut={() =>
                animatePress(
                  sendScaleAnim,
                  false,
                )
              }
              activeOpacity={1}
              disabled={isLoading}
              accessibilityLabel="Dừng tạo"
            >
              <Square
                size={ICON_SIZE}
                color={colors.white}
                fill={colors.white}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View
            style={{
              transform: [
                {
                  scale: sendScaleAnim,
                },
              ],
            }}
          >
            <TouchableOpacity
              style={[
                styles.sendButton,
                !canSend &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSendPress}
              onPressIn={() =>
                animatePress(
                  sendScaleAnim,
                  true,
                )
              }
              onPressOut={() =>
                animatePress(
                  sendScaleAnim,
                  false,
                )
              }
              activeOpacity={1}
              disabled={!canSend}
              accessibilityLabel="Gửi tin nhắn"
            >
              <Send
                size={ICON_SIZE}
                color={colors.white}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal:
      CONTAINER_HORIZONTAL_PADDING,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
  },

  inputWrapper: {
    flex: 1,
    minHeight: 48,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,

    backgroundColor: colors.surface,

    paddingHorizontal:
      INPUT_HORIZONTAL_PADDING,
  },

  inputWrapperListening: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },

  textInput: {
    flex: 1,

    fontSize: 15.5,
    lineHeight: 22,

    color: colors.text,

    paddingVertical: 0,
    paddingHorizontal: 0,

    minHeight: 28,
  },

  iconButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,

    borderRadius:
      BUTTON_SIZE / 2,

    justifyContent: 'center',
    alignItems: 'center',

    position: 'relative',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  pulseRing: {
    position: 'absolute',

    width: BUTTON_SIZE,
    height: BUTTON_SIZE,

    borderRadius:
      BUTTON_SIZE / 2,

    borderWidth: 2,
    borderColor: colors.primary,
  },

  sendButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,

    borderRadius:
      BUTTON_SIZE / 2,

    backgroundColor:
      colors.primary,

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor:
      colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  sendButtonDisabled: {
    opacity: 0.35,

    shadowOpacity: 0,
    elevation: 0,
  },
});

export default React.memo(ChatInput);