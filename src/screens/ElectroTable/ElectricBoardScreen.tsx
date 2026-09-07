import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
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

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const compareSessionRef = useRef(0);

  const params = route.params ?? defaultBoardParams;
  const { groupCount, characterType } = params;
  const [frequency, setFrequency] = useState(600);
  const [wpm, setWpm] = useState(params.wpm ?? defaultBoardParams.wpm);
  const cpm = wpm * 5;

  // State lưu index ký tự đang được phát (-1: không phát)
  const [activeCharIndex, setActiveCharIndex] = useState<number>(-1);

  const board = useMemo(
    () => generateMorseBoard({ groupCount, characterType }),
    [groupCount, characterType],
  );
  const groups = board.groups.slice(1, -1);

  // Đăng ký listener nhận sự kiện từ Engine
  useEffect(() => {
    morseAudio.setOnProgress((textIndex, _char) => {
      setActiveCharIndex(textIndex);
    });

    return () => {
      morseAudio.setOnProgress(null);
      morseAudio.stop();
    };
  }, []);

  // Chuỗi phát đầy đủ: "= 12345 ABCDE +"
  const fullPlaybackText = useMemo(() => {
    return board.groups.join(' ');
  }, [board.groups]);

  const playBoard = async () => {
    // 1. Đang phát -> Chuyển sang TẠM DỪNG
    if (isPlaying && !isPaused) {
      morseAudio.pause();
      setIsPaused(true);
      return;
    }

    // 2. Đang tạm dừng -> TIẾP TỤC phát từ vị trí cũ
    if (isPlaying && isPaused) {
      setIsPaused(false);
      morseAudio.resume();
      return;
    }

    // 3. Chưa phát (hoặc đã kết thúc/reset) -> BẮT ĐẦU PHÁT MỚI
    morseAudio.setFrequency(frequency);
    morseAudio.setWpm(wpm);
    morseAudio.setVolume(0.5);
    setIsPlaying(true);
    setIsPaused(false);
    setHasPlayed(true);

    try {
      await morseAudio.playText(fullPlaybackText);
    } finally {
      // Chỉ tắt hoàn toàn khi kết thúc bài (không bị pause dở)
      if (!morseAudio.getIsPaused()) {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveCharIndex(-1);
      }
    }
  };

  const handleResetAudio = () => {
    if (!isLoading) {
      morseAudio.stop();
      setIsPlaying(false);
      setIsPaused(false);
      setHasPlayed(false);
      setActiveCharIndex(-1);
    }
  };

  const compareBoard = async () => {
    if (isLoading) {
      compareSessionRef.current += 1;
      stopCharacterAudio();
      setIsComparing(false);
      setIsLoading(false);
      return;
    }

    const sessionId = compareSessionRef.current + 1;
    compareSessionRef.current = sessionId;
    setIsLoading(true);
    setIsComparing(true);
    setHasCompared(true);

    try {
      const orderedCharacters = groups.flatMap(group => group.split(''));
      for (const char of orderedCharacters) {
        if (compareSessionRef.current !== sessionId) return;

        const normalizedChar = char.toUpperCase();
        if (!normalizedChar) continue;

        await playCharacterAudio(normalizedChar);
        if (compareSessionRef.current !== sessionId) return;

        await new Promise(resolve => setTimeout(resolve, 180));
      }
    } finally {
      if (compareSessionRef.current === sessionId) {
        setIsComparing(false);
        setIsLoading(false);
      }
    }
  };

  const resetComparison = () => {
    compareSessionRef.current += 1;
    stopCharacterAudio();
    setIsComparing(false);
    setIsLoading(false);
    setHasCompared(false);
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
                ? 'ĐIỆN TÍN SỐ'
                : characterType === 'shortNumber'
                ? 'ĐIỆN TÍN SỐ TẮT'
                : characterType === 'mixed'
                ? 'ĐIỆN TÍN HỖN HỢP'
                : 'BỨC ĐIỆN TÍN QUÂN SỰ'}
            </Text>
            <View style={styles.sheetTopDot} />
          </View>

          {/* 1. Dấu hiệu bắt đầu '=' (nằm tại vị trí 0 của chuỗi fullPlaybackText) */}
          <View
            style={[
              styles.markerBadge,
              activeCharIndex === 0 && styles.markerBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.markerText,
                activeCharIndex === 0 && styles.markerTextActive,
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

                        // Vì board.groups[0] là '=', nên nhóm đầu tiên groups[0]
                        // trong fullPlaybackText bắt đầu sau "= " (tức là index 2)
                        // Mỗi nhóm 5 ký tự + 1 dấu cách = 6 ký tự
                        const groupStartIndexInText =
                          2 + currentGroupGlobalIndex * 6;

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
                                const currentCharIndex =
                                  groupStartIndexInText + charOffset;
                                const isHighlighted =
                                  activeCharIndex === currentCharIndex;

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

          {/* 3. Dấu hiệu kết thúc '+' (nằm ở ký tự cuối cùng của chuỗi fullPlaybackText) */}
          <View
            style={[
              styles.markerBadge,
              styles.markerBadgeEnd,
              activeCharIndex === fullPlaybackText.length - 1 &&
                styles.markerBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.markerText,
                activeCharIndex === fullPlaybackText.length - 1 &&
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
              isPaused && styles.playBtnPaused, // Gợi ý: màu cam hổ phách
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

          <View style={styles.compareBtnRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.compareBtn,
                isComparing && styles.compareBtnActive,
              ]}
              onPress={compareBoard}
            >
              {isComparing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Check size={18} color="#FFFFFF" />
              )}
              <Text style={styles.compareBtnText}>
                {isComparing ? 'Đang đọc dò bài...' : 'Đọc đối chiếu từng chữ'}
              </Text>
            </TouchableOpacity>

            {hasCompared && (
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isComparing}
                style={[styles.iconButton, isComparing && { opacity: 0.5 }]}
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
