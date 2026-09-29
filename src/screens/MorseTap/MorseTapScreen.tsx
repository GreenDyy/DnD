import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  RotateCcw,
  Radio,
  Volume2,
  ChevronRight,
  Lightbulb,
  Circle,
  Minus,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { morseAudio } from '../../audio/MorseAudioEngine';
import { colors } from '../../theme';
import { icons } from '../../assets';

const HOLD_THRESHOLD = 400;

export default function MorseTapScreen() {
  const navigation = useNavigation();

  const [isHolding, setIsHolding] = useState(false);
  const [holdDuration, setHoldDuration] = useState(0);

  const pressStartTime = useRef<number | null>(null);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const statusAnim = useRef(new Animated.Value(0)).current;

  // --------------------------------------------------
  // PRESS IN
  // --------------------------------------------------

  const handlePressIn = () => {
    pressStartTime.current = Date.now();

    setIsHolding(true);
    setHoldDuration(0);

    // Bắt đầu phát âm thanh ngay khi nhấn
    void morseAudio.startManualTone();

    // Button scale
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();

    // Ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Hiển thị thời gian đang giữ
    durationInterval.current = setInterval(() => {
      if (pressStartTime.current === null) return;

      const duration = Date.now() - pressStartTime.current;

      setHoldDuration(Math.round(duration));
    }, 50);
  };

  // --------------------------------------------------
  // PRESS OUT
  // --------------------------------------------------

  const handlePressOut = () => {
    const start = pressStartTime.current;

    if (start === null) return;

    const duration = Date.now() - start;

    // Clear interval
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }

    pressStartTime.current = null;

    // Dừng âm thanh
    morseAudio.stopManualTone();

    setIsHolding(false);
    setHoldDuration(Math.round(duration));

    // Reset button
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();

    // Stop ring animation
    ringAnim.stopAnimation();
    Animated.timing(ringAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    /*
     * Ở đây chỉ xác định loại Morse.
     *
     * Hiện tại UI không cần hiển thị nó.
     * Sau này nếu muốn đưa vào bài luyện tập
     * thì có thể dùng symbol này.
     */
    const symbol = duration >= HOLD_THRESHOLD ? '—' : '•';

    console.log(
      `Morse: ${symbol} | duration: ${Math.round(duration)}ms`,
    );
  };

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  const handleReset = () => {
    pressStartTime.current = null;

    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }

    morseAudio.stopManualTone();

    setIsHolding(false);
    setHoldDuration(0);

    scaleAnim.setValue(1);

    ringAnim.stopAnimation();
    ringAnim.setValue(0);
  };

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      morseAudio.stopManualTone();

      ringAnim.stopAnimation();
    };
  }, []);

  // --------------------------------------------------
  // ANIMATION
  // --------------------------------------------------

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });

  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <ArrowLeft
            size={25}
            color={colors.primary}
            strokeWidth={2.4}
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Gõ Morse</Text>

          <Text style={styles.headerSubtitle}>
            Nhấn nhanh để gõ Tích, giữ để gõ Tà
          </Text>
        </View>

        <Pressable
          onPress={handleReset}
          style={styles.headerButton}
        >
          <RotateCcw
            size={22}
            color={colors.primary}
            strokeWidth={2.2}
          />
        </Pressable>
      </View>

      {/* ================================================= */}
      {/* MORSE GUIDE */}
      {/* ================================================= */}

      <View style={styles.morseGuide}>
        {/* TÍCH */}

        <View style={styles.guideItem}>
          <View style={styles.symbolCircle}>
            <Circle
              size={25}
              color={colors.primary}
              fill={colors.primary}
              strokeWidth={0}
            />
          </View>

          <View>
            <Text style={styles.guideTitle}>Tích</Text>

            <Text style={styles.guideSubtitle}>
              Nhấn nhanh
            </Text>
          </View>
        </View>

        {/* DIVIDER */}

        <View style={styles.guideDivider} />

        {/* TÀ */}

        <View style={styles.guideItem}>
          <View style={styles.symbolCircle}>
            <Minus
              size={32}
              color={colors.primary}
              strokeWidth={5}
            />
          </View>

          <View>
            <Text style={styles.guideTitle}>Tà</Text>

            <Text style={styles.guideSubtitle}>
              Giữ ≥ 400ms
            </Text>
          </View>
        </View>
      </View>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <View style={styles.mainContent}>
        {/* ================================================= */}
        {/* TAP BUTTON */}
        {/* ================================================= */}

        <View style={styles.tapArea}>
          {/* Outer animated ring */}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.outerRingAnimated,
              {
                opacity: ringOpacity,
                transform: [
                  {
                    scale: ringScale,
                  },
                ],
              },
            ]}
          />

          {/* Static rings */}

          <View style={styles.outerRing} />

          <View style={styles.middleRing}>
            <Animated.View
              style={[
                styles.tapButtonWrapper,
                {
                  transform: [
                    {
                      scale: scaleAnim,
                    },
                  ],
                },
              ]}
            >
              <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={({ pressed }) => [
                  styles.tapButton,
                  pressed && styles.tapButtonPressed,
                ]}
              >
                {/* <Radio
                  size={62}
                  color="#FFFFFF"
                  strokeWidth={1.8}
                /> */}

                <Image source={icons.tap} style={{ width: 62, height: 62 }} />

              
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* ================================================= */}
        {/* STATUS */}
        {/* ================================================= */}

        <View
          style={[
            styles.statusPill,
            isHolding && styles.statusPillActive,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isHolding && styles.statusDotActive,
            ]}
          />

          <Text style={styles.statusText}>
            {isHolding
              ? holdDuration >= HOLD_THRESHOLD
                ? 'Đang phát Tà'
                : 'Đang phát...'
              : 'Sẵn sàng'}
          </Text>
        </View>

        {/* ================================================= */}
        {/* AUDIO CARD */}
        {/* ================================================= */}

        <Pressable style={styles.audioCard}>
          <View style={styles.audioIcon}>
            <Volume2
              size={28}
              color={colors.primary}
              strokeWidth={2}
            />
          </View>

          <View style={styles.audioContent}>
            <Text style={styles.audioTitle}>
              Âm thanh Morse
            </Text>

            <Text style={styles.audioSubtitle}>
              Phát ở tần số 600 Hz
            </Text>
          </View>

          <ChevronRight
            size={25}
            color={colors.primary}
            strokeWidth={2}
          />
        </Pressable>

        {/* ================================================= */}
        {/* TIP */}
        {/* ================================================= */}

        <View style={styles.tipContainer}>
          <View style={styles.tipIcon}>
            <Lightbulb
              size={25}
              color={colors.primary}
              strokeWidth={2}
            />
          </View>

          <Text style={styles.tipText}>
            Mỗi nhịp gõ của bạn{'\n'}
            là một dấu chấm, một dấu gạch,{'\n'}
            đưa bạn đến gần hơn với Morse!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FCFA',
  },

  // ---------------------------------------------------
  // HEADER
  // ---------------------------------------------------

  header: {
    minHeight: 94,
    paddingHorizontal: 18,
    paddingTop: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 54,
    height: 54,

    borderRadius: 18,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#164E45',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#123B38',
    letterSpacing: -0.8,
  },

  headerSubtitle: {
    marginTop: 4,

    fontSize: 14,
    lineHeight: 20,

    color: '#648784',
    textAlign: 'center',
  },

  // ---------------------------------------------------
  // MORSE GUIDE
  // ---------------------------------------------------

  morseGuide: {
    marginHorizontal: 18,
    marginTop: 12,

    minHeight: 128,

    paddingHorizontal: 22,

    borderRadius: 28,

    backgroundColor: '#E8F8F2',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  guideItem: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 14,
  },

  symbolCircle: {
    width: 64,
    height: 64,

    borderRadius: 32,

    backgroundColor: '#D4F3E7',

    alignItems: 'center',
    justifyContent: 'center',
  },

  guideTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#145C50',
  },

  guideSubtitle: {
    marginTop: 3,

    fontSize: 15,
    color: '#5B8880',
  },

  guideDivider: {
    width: 1,
    height: 76,

    backgroundColor: '#C7E8DD',

    marginHorizontal: 8,
  },

  // ---------------------------------------------------
  // MAIN
  // ---------------------------------------------------

  mainContent: {
    flex: 1,

    alignItems: 'center',

    paddingHorizontal: 18,
    paddingTop: 28,
  },

  // ---------------------------------------------------
  // TAP AREA
  // ---------------------------------------------------

  tapArea: {
    width: 330,
    height: 330,

    alignItems: 'center',
    justifyContent: 'center',
  },

  outerRingAnimated: {
    position: 'absolute',

    width: 280,
    height: 280,

    borderRadius: 140,

    backgroundColor: '#B8F2DB',
  },

  outerRing: {
    position: 'absolute',

    width: 300,
    height: 300,

    borderRadius: 150,

    backgroundColor: '#EDF9F5',

    borderWidth: 1,
    borderColor: '#D8F3E9',
  },

  middleRing: {
    width: 244,
    height: 244,

    borderRadius: 122,

    backgroundColor: '#D8F7EA',

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 7,
    borderColor: '#B9EFD9',
  },

  tapButtonWrapper: {
    width: 210,
    height: 210,

    borderRadius: 105,

    alignItems: 'center',
    justifyContent: 'center',
  },

  tapButton: {
    width: 196,
    height: 196,

    borderRadius: 98,

    backgroundColor: '#19A873',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#0B7654',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },

  tapButtonPressed: {
    backgroundColor: '#148E62',
  },

  tapButtonText: {
    marginTop: 8,

    fontSize: 20,
    fontWeight: '800',

    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // ---------------------------------------------------
  // STATUS
  // ---------------------------------------------------

  statusPill: {
    marginTop: -4,

    minWidth: 150,
    height: 48,

    paddingHorizontal: 20,

    borderRadius: 24,

    backgroundColor: '#E4F8EF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 9,
  },

  statusPillActive: {
    backgroundColor: '#D3F5E5',
  },

  statusDot: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: '#2BB987',
  },

  statusDotActive: {
    transform: [{ scale: 1.15 }],
  },

  statusText: {
    fontSize: 15,
    fontWeight: '600',

    color: '#319C78',
  },

  // ---------------------------------------------------
  // AUDIO CARD
  // ---------------------------------------------------

  audioCard: {
    width: '100%',
    minHeight: 100,

    marginTop: 26,

    paddingHorizontal: 20,

    borderRadius: 25,

    backgroundColor: '#E9F8F2',

    flexDirection: 'row',
    alignItems: 'center',
  },

  audioIcon: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: '#D0F2E4',

    alignItems: 'center',
    justifyContent: 'center',
  },

  audioContent: {
    flex: 1,

    marginLeft: 16,
  },

  audioTitle: {
    fontSize: 18,
    fontWeight: '800',

    color: '#145C50',
  },

  audioSubtitle: {
    marginTop: 4,

    fontSize: 14,
    color: '#638B84',
  },

  // ---------------------------------------------------
  // TIP
  // ---------------------------------------------------

  tipContainer: {
    marginTop: 24,

    paddingHorizontal: 22,
    paddingVertical: 16,

    borderRadius: 28,

    backgroundColor: '#E8F8F2',

    flexDirection: 'row',
    alignItems: 'center',

    maxWidth: 340,
  },

  tipIcon: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: '#D2F3E5',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  tipText: {
    flex: 1,

    fontSize: 13.5,
    lineHeight: 20,

    color: '#55847B',
  },
});