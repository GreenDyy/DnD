import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  ArrowLeft,
  Check,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Volume2,
} from 'lucide-react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { morseAudio } from '../../audio/MorseAudioEngine';
import { playCharacterAudio, stopCharacterAudio } from '../../assets/audioMap';
import { generateMorseBoard } from '../../utils/morseGenerator';
import { createElectricBoardStyles } from './boardStyles';
import { type RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ElectricBoardScreen'>;

const defaultBoardParams = {
  groupCount: 10,
  characterType: 'letter' as const,
  wpm: 20,
};

const ElectricBoardScreen = ({ route, navigation }: Props) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Grid layout: 4 nhóm/hàng trên màn hình lớn hoặc 3 nhóm/hàng trên màn nhỏ
  const groupsPerRow = screenWidth < 380 ? 3 : 4;
  const styles = createElectricBoardStyles(
    screenWidth,
    screenHeight,
    groupsPerRow,
  );

  // Chỉ số ký tự khi phát tín hiệu Morse (= 12345 ABCDE +)
  const [activeMorseIndex, setActiveMorseIndex] = useState<number>(-1);

  // Chỉ số ký tự khi đọc đối chiếu (chỉ tính các ký tự trong các nhóm từ 0 -> n)
  const [activeCompareIndex, setActiveCompareIndex] = useState<number>(-1);

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  // Quản lý trạng thái đối chiếu
  const [isComparing, setIsComparing] = useState(false);
  const [isComparePaused, setIsComparePaused] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const [useShortNumbers, setUseShortNumbers] = useState(false);
  const compareSessionRef = useRef(0);
  const currentCharIndexRef = useRef(0);
  const compareResumeResolverRef = useRef<(() => void) | null>(null);
  const isComparePausedRef = useRef(false);

  const params = route.params ?? defaultBoardParams;
  const { groupCount, characterType } = params;
  const [frequency, setFrequency] = useState(600);
  const [wpm, setWpm] = useState(params.wpm ?? defaultBoardParams.wpm);
  const cpm = wpm * 5;

  // Các mốc tốc độ đối chiếu
  const COMPARE_SPEEDS = [1, 1.25, 1.5, 2] as const;
  type CompareSpeed = (typeof COMPARE_SPEEDS)[number];

  // Tốc độ phát âm thanh đối chiếu (1x, 1.25x, 1.5x, 2x)
  const [compareSpeed, setCompareSpeed] = useState<CompareSpeed>(1);

  const board = useMemo(
    () => generateMorseBoard({ groupCount, characterType }),
    [groupCount, characterType],
  );
  const groups = board.groups.slice(1, -1);

  // Đăng ký listener nhận sự kiện từ Engine
  useEffect(() => {
    morseAudio.setOnProgress((textIndex, _char) => {
      setActiveMorseIndex(textIndex);
    });

    return () => {
      morseAudio.setOnProgress(null);
      morseAudio.stop();
    };
  }, []);

  // Cập nhật engine mỗi khi toggle
  const handleToggleShortNumbers = (value: boolean) => {
    setUseShortNumbers(value);
    morseAudio.setUseShortNumbers(value);
  };

  // Chuỗi phát đầy đủ: "= 12345 ABCDE +"
  const fullPlaybackText = useMemo(() => {
    return board.groups.join(' ');
  }, [board.groups]);

  const playBoard = async () => {
    // Dừng đối chiếu nếu đang chạy
    if (isComparing) {
      resetComparison();
    }

    if (isPlaying && !isPaused) {
      morseAudio.pause();
      setIsPaused(true);
      return;
    }

    if (isPlaying && isPaused) {
      setIsPaused(false);
      morseAudio.resume();
      return;
    }

    morseAudio.setFrequency(frequency);
    morseAudio.setWpm(wpm);
    morseAudio.setVolume(0.5);
    setIsPlaying(true);
    setIsPaused(false);
    setHasPlayed(true);
    setActiveCompareIndex(-1); // Reset highlight đối chiếu

    try {
      await morseAudio.playText(fullPlaybackText);
    } finally {
      if (!morseAudio.getIsPaused()) {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveMorseIndex(-1);
      }
    }
  };

  const handleResetAudio = () => {
    if (!isLoading) {
      morseAudio.stop();
      setIsPlaying(false);
      setIsPaused(false);
      setHasPlayed(false);
      setActiveMorseIndex(-1);
    }
  };

  const compareBoard = async () => {
    // Dừng phát điện nếu đang phát
    if (isPlaying) {
      handleResetAudio();
    }

    if (isComparing && !isComparePaused) {
      isComparePausedRef.current = true;
      setIsComparePaused(true);
      stopCharacterAudio();
      return;
    }

    if (isComparing && isComparePaused) {
      isComparePausedRef.current = false;
      setIsComparePaused(false);
      if (compareResumeResolverRef.current) {
        compareResumeResolverRef.current();
        compareResumeResolverRef.current = null;
      }
      return;
    }

    const sessionId = compareSessionRef.current + 1;
    compareSessionRef.current = sessionId;
    isComparePausedRef.current = false;
    currentCharIndexRef.current = 0;

    setIsLoading(true);
    setIsComparing(true);
    setIsComparePaused(false);
    setHasCompared(true);
    setActiveMorseIndex(-1); // Xóa highlight phát điện

    try {
      const orderedCharacters = groups.flatMap(group => group.split(''));

      for (let i = 0; i < orderedCharacters.length; i++) {
        if (compareSessionRef.current !== sessionId) return;

        currentCharIndexRef.current = i;
        // Gán index chính xác từ 0, 1, 2...
        setActiveCompareIndex(i);

        while (isComparePausedRef.current) {
          if (compareSessionRef.current !== sessionId) return;
          await new Promise<void>(resolve => {
            compareResumeResolverRef.current = resolve;
          });
        }

        const char = orderedCharacters[i];
        const normalizedChar = char.toUpperCase();
        if (!normalizedChar) continue;

        try {
          await playCharacterAudio(normalizedChar, compareSpeed);
        } catch {
          // Bỏ qua lỗi ngắt âm giữa chừng
        }

        if (compareSessionRef.current !== sessionId) return;

        const baseGap = 180;
        const adjustedGap = Math.max(50, Math.round(baseGap / compareSpeed));
        await new Promise(resolve => setTimeout(resolve, adjustedGap));
      }
    } finally {
      if (compareSessionRef.current === sessionId) {
        isComparePausedRef.current = false;
        setIsComparing(false);
        setIsComparePaused(false);
        setIsLoading(false);
        setActiveCompareIndex(-1);
      }
    }
  };

  const resetComparison = () => {
    compareSessionRef.current += 1;
    isComparePausedRef.current = false;
    stopCharacterAudio();

    if (compareResumeResolverRef.current) {
      compareResumeResolverRef.current();
      compareResumeResolverRef.current = null;
    }

    setIsComparing(false);
    setIsComparePaused(false);
    setIsLoading(false);
    setHasCompared(false);
    setActiveCompareIndex(-1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={isLoading}
          style={[styles.backButton, isLoading && { opacity: 0.5 }]}
          onPress={() => !isLoading && navigation.goBack()}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>BẢNG ĐIỆN LUYỆN TẬP</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Tổng quan */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>TÍN HIỆU VÔ TUYẾN</Text>
            </View>
            <View style={styles.statsPill}>
              <Text style={styles.statsPillText}>{groups.length} Nhóm</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Phòng thu & Đối chiếu</Text>
          <Text style={styles.heroSubtitle}>
            Nghe bức điện tín, chép ra giấy nháp và kích hoạt đối chiếu từng ký
            tự.
          </Text>

          <View style={styles.quickSpecs}>
            <View style={styles.specItem}>
              <Volume2 size={15} color="#4F46E5" />
              <Text style={styles.specLabel}>{frequency} Hz</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Sliders size={15} color="#4F46E5" />
              <Text style={styles.specLabel}>
                {cpm} chữ/phút ({wpm} WPM)
              </Text>
            </View>
          </View>
        </View>

        {/* BẢNG ĐIỆN MORSE (TELEGRAPH SHEET) */}
        <View style={styles.boardCard}>
          <View style={styles.sheetTopBanner}>
            <View style={styles.sheetTopDot} />
            <Text style={styles.sheetTopTitle}>
              {characterType === 'letter'
                ? 'ĐIỆN TÍN CHỮ CÁI'
                : characterType === 'number'
                ? `ĐIỆN TÍN SỐ ${useShortNumbers ? 'TẮT' : ''}`
                : characterType === 'mixed'
                ? 'ĐIỆN TÍN HỖN HỢP'
                : 'BỨC ĐIỆN TÍN QUÂN SỰ'}
            </Text>
            <View style={styles.sheetTopDot} />
          </View>

          {/* 1. Dấu hiệu bắt đầu '=' */}
          <View
            style={[
              styles.markerBadge,
              activeMorseIndex === 0 && styles.markerBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.markerText,
                activeMorseIndex === 0 && styles.markerTextActive,
              ]}
            >
              = (BẮT ĐẦU PHÁT)
            </Text>
          </View>

          {/* 2. Lưới các nhóm ký tự */}
          <View style={styles.gridContainer}>
            {Array.from(
              { length: Math.ceil(groups.length / groupsPerRow) },
              (_, rowIndex) => {
                const rowGroups = groups.slice(
                  rowIndex * groupsPerRow,
                  rowIndex * groupsPerRow + groupsPerRow,
                );
                const endNumber = Math.min(
                  (rowIndex + 1) * groupsPerRow,
                  groups.length,
                );

                return (
                  <View key={`row-${rowIndex}`} style={styles.boardRow}>
                    <View style={styles.cellsRow}>
                      {rowGroups.map((group, groupIdx) => {
                        const currentGroupGlobalIndex =
                          rowIndex * groupsPerRow + groupIdx;

                        // Index khi phát Morse (bỏ qua '= ')
                        const morseGroupStartIndex =
                          2 + currentGroupGlobalIndex * 6;

                        // Index khi đối chiếu (đếm tuần tự 5 ký tự mỗi nhóm)
                        const compareGroupStartIndex =
                          currentGroupGlobalIndex * 5;

                        return (
                          <View
                            key={`${group}-${groupIdx}`}
                            style={styles.groupCell}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              {group.split('').map((char, charOffset) => {
                                // Vị trí thực tế của ký tự
                                const morseCharIdx =
                                  morseGroupStartIndex + charOffset;
                                const compareCharIdx =
                                  compareGroupStartIndex + charOffset;

                                // Highlight nếu khớp với luồng Morse HOẶC luồng Đối chiếu
                                const isHighlighted =
                                  activeMorseIndex === morseCharIdx ||
                                  activeCompareIndex === compareCharIdx;

                                return (
                                  <Text
                                    key={`${char}-${charOffset}`}
                                    style={[
                                      styles.groupText,
                                      isHighlighted && styles.charHighlighted,
                                    ]}
                                  >
                                    {char}
                                  </Text>
                                );
                              })}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                    <View style={styles.rowCounter}>
                      <Text style={styles.rowCounterText}>#{endNumber}</Text>
                    </View>
                  </View>
                );
              },
            )}
          </View>

          {/* 3. Dấu hiệu kết thúc '+' */}
          <View
            style={[
              styles.markerBadge,
              styles.markerBadgeEnd,
              activeMorseIndex === fullPlaybackText.length - 1 &&
                styles.markerBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.markerText,
                activeMorseIndex === fullPlaybackText.length - 1 &&
                  styles.markerTextActive,
              ]}
            >
              + (HẾT BỨC ĐIỆN)
            </Text>
          </View>
        </View>

        {/* Thanh Điều Khiển Phát Điện */}
        <View style={styles.audioActionCard}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.playBtn,
              isPlaying && !isPaused && styles.playBtnActive,
              isPaused && { backgroundColor: '#D97706' }, // Gợi ý: màu cam hổ phách
            ]}
            onPress={playBoard}
          >
            {isPlaying && !isPaused ? (
              <Pause size={18} color="#FFFFFF" />
            ) : (
              <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
            )}
            <Text style={styles.playBtnText}>
              {isPlaying && !isPaused
                ? 'Tạm dừng phát'
                : isPaused
                ? 'Tiếp tục phát'
                : 'Bắt đầu phát điện'}
            </Text>
          </TouchableOpacity>

          {hasPlayed && (
            <TouchableOpacity
              accessibilityLabel="Đặt lại bài phát"
              activeOpacity={0.8}
              disabled={isLoading}
              style={[styles.iconButton, isLoading && { opacity: 0.5 }]}
              onPress={handleResetAudio}
            >
              <RotateCcw size={18} color="#475569" />
            </TouchableOpacity>
          )}
        </View>

        {/* Khu vực Đối chiếu */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Đối chiếu kết quả thu</Text>
          <Headphones size={16} color="#64748B" />
        </View>

        <View style={styles.compareCard}>
          <Text style={styles.compareDesc}>
            Sau khi đã ghi chép lại bức điện ra giấy, nhấn nút dưới đây để hệ
            thống đọc âm từng chữ giúp bạn dò lỗi.
          </Text>

          {/* Hàng chọn tốc độ đọc: 1x, 1.25x, 1.5x, 2x */}
          <View style={styles.speedSelectorRow}>
            <Text style={styles.speedLabel}>Tốc độ đọc:</Text>
            <View style={styles.speedButtonGroup}>
              {COMPARE_SPEEDS.map(speed => (
                <TouchableOpacity
                  key={speed}
                  disabled={isComparing}
                  activeOpacity={0.7}
                  style={[
                    styles.speedChip,
                    compareSpeed === speed && styles.speedChipActive,
                    isComparing && { opacity: 0.6 },
                  ]}
                  onPress={() => setCompareSpeed(speed)}
                >
                  <Text
                    style={[
                      styles.speedChipText,
                      compareSpeed === speed && styles.speedChipTextActive,
                    ]}
                  >
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nút bấm đối chiếu */}
          <View style={styles.compareBtnRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.compareBtn,
                isComparing && !isComparePaused && styles.compareBtnActive,
                isComparePaused && { backgroundColor: '#F59E0B' }, // Nền màu cam khi tạm dừng
              ]}
              onPress={compareBoard}
            >
              {isComparing && !isComparePaused ? (
                <Pause size={18} color="#FFFFFF" />
              ) : (
                <Check size={18} color="#FFFFFF" />
              )}
              <Text style={styles.compareBtnText}>
                {isComparing && !isComparePaused
                  ? 'Tạm dừng đối chiếu'
                  : isComparePaused
                  ? 'Tiếp tục đối chiếu'
                  : `Đọc đối chiếu (${compareSpeed}x)`}
              </Text>
            </TouchableOpacity>

            {hasCompared && (
              <TouchableOpacity
                accessibilityLabel="Đặt lại đối chiếu"
                activeOpacity={0.8}
                style={styles.iconButton}
                onPress={resetComparison}
              >
                <RotateCcw size={18} color="#475569" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tùy chỉnh thông số */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cài đặt âm lượng & tốc độ</Text>
        </View>

        {characterType !== 'letter' && (
          <View style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Chế độ phát số tắt</Text>
              <Text style={styles.toggleDesc}>
                Rút ngắn mã Morse cho các số 0 (-), 1 (.-), 2 (..-), 8 (-..), 9
                (-.)
              </Text>
            </View>
            <Switch
              value={useShortNumbers}
              onValueChange={handleToggleShortNumbers}
              disabled={isPlaying}
              trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
              thumbColor={useShortNumbers ? '#4F46E5' : '#F8FAFC'}
            />
          </View>
        )}

        {/* Slider Tần số */}
        <View style={styles.sliderCard}>
          <View style={styles.sliderHead}>
            <Text style={styles.sliderLabel}>Tần số âm (Pitch)</Text>
            <Text style={styles.sliderValue}>{frequency} Hz</Text>
          </View>
          <Slider
            minimumValue={200}
            maximumValue={1500}
            step={10}
            value={frequency}
            minimumTrackTintColor="#4F46E5"
            maximumTrackTintColor="#E2E8F0"
            thumbTintColor="#4F46E5"
            onValueChange={setFrequency}
          />
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeSub}>200 Hz (Trầm)</Text>
            <Text style={styles.rangeSub}>1500 Hz (Bổng)</Text>
          </View>
        </View>

        {/* Slider Tốc độ */}
        <View style={styles.sliderCard}>
          <View style={styles.sliderHead}>
            <Text style={styles.sliderLabel}>Tốc độ phát</Text>
            <Text style={styles.sliderValue}>
              {cpm} chữ / phút ({wpm} WPM)
            </Text>
          </View>
          <Slider
            minimumValue={5}
            maximumValue={60}
            step={1}
            value={wpm}
            minimumTrackTintColor="#4F46E5"
            maximumTrackTintColor="#E2E8F0"
            thumbTintColor="#4F46E5"
            onValueChange={setWpm}
          />
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeSub}>25 CPM (Chậm)</Text>
            <Text style={styles.rangeSub}>300 CPM (Nhanh)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ElectricBoardScreen;
