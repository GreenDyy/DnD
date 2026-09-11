import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { ArrowLeft, Headphones, Sliders, Volume2 } from 'lucide-react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { morseAudio } from '../../audio/MorseAudioEngine';
import { playCharacterAudio, stopCharacterAudio } from '../../assets/audioMap';
import { generateMorseBoard } from '../../utils/morseGenerator';
import { createElectricBoardStyles } from './boardStyles';
import { type RootStackParamList } from '../../types/navigation';
import {
  getDisplayPreamble,
  getPlaybackPreamble,
  type PreambleData,
} from '../../utils/preambleHelper';

// Import các sub-components dùng chung vừa tạo
import { MorseTelegraphSheet } from '../../components/ElectricTable/MorseTelegraphSheetProps';
import { PreambleConfigCard } from '../../components/ElectricTable/PreambleConfigCard';
import {
  CompareControlCard,
  type CompareSpeed,
} from '../../components/ElectricTable/CompareControlCard';
import { AudioPlaybackControls } from '../../components/ElectricTable/AudioPlaybackControls';
import { SliderCustom } from '../../components/Common/SliderCustom';

type Props = NativeStackScreenProps<RootStackParamList, 'ElectricBoardScreen'>;

const defaultBoardParams = {
  groupCount: 10,
  characterType: 'letter' as const,
  cpm: 100,
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

  const params = route.params ?? defaultBoardParams;
  const { groupCount, characterType } = params;

  // 1. Khởi tạo mảng các nhóm ký tự
  const board = useMemo(
    () => generateMorseBoard({ groupCount, characterType }),
    [groupCount, characterType],
  );
  const groups = useMemo(() => board.groups.slice(1, -1), [board.groups]);

  // 2. Quản lý trạng thái phát âm thanh Morse
  const [activeMorseIndex, setActiveMorseIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  // 3. Quản lý trạng thái đối chiếu
  const [activeCompareIndex, setActiveCompareIndex] = useState<number>(-1);
  const [isComparing, setIsComparing] = useState(false);
  const [isComparePaused, setIsComparePaused] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const [compareSpeed, setCompareSpeed] = useState<CompareSpeed>(1);

  // Refs điều khiển luồng ngắt / tiếp tục phát
  const compareSessionRef = useRef(0);
  const currentCharIndexRef = useRef(0);
  const compareResumeResolverRef = useRef<(() => void) | null>(null);
  const isComparePausedRef = useRef(false);

  // 4. Cấu hình tần số, tốc độ & số tắt
  const [useShortNumbers, setUseShortNumbers] = useState(false);
  const [frequency, setFrequency] = useState(600);
  const [cpm, setCpm] = useState(params.cpm ?? defaultBoardParams.cpm);

  // 5. Cấu hình đầu điện (Preamble)
  const [hasPreamble, setHasPreamble] = useState(false);
  const [nrValue, setNrValue] = useState('01/HL');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);

  // Tính toán chuỗi đầu điện
  const preambleData: PreambleData = useMemo(
    () => ({
      nr: nrValue,
      groupCount: groups.length,
      date: selectedDate,
      time: selectedTime,
    }),
    [nrValue, groups.length, selectedDate, selectedTime],
  );

  const preamblePlaybackText = useMemo(
    () => getPlaybackPreamble(preambleData),
    [preambleData],
  );
  const preambleDisplayText = useMemo(
    () => getDisplayPreamble(preambleData),
    [preambleData],
  );

  // Chuỗi phát âm Morse hoàn chỉnh
  const fullPlaybackText = useMemo(() => {
    const bodyText = groups.join(' ');
    if (hasPreamble) {
      return `${preamblePlaybackText} = ${bodyText} +`;
    }
    return `= ${bodyText} +`;
  }, [hasPreamble, preamblePlaybackText, groups]);

  // Vị trí offset của dấu = và ký tự đầu tiên
  const equalSignIndex = useMemo(() => {
    if (hasPreamble) return preamblePlaybackText.length + 1;
    return 0;
  }, [hasPreamble, preamblePlaybackText]);

  const firstGroupStartIndex = equalSignIndex + 2;

  // Lắng nghe callback tiến trình phát Morse từ Engine
  useEffect(() => {
    morseAudio.setOnProgress((textIndex, _char) => {
      setActiveMorseIndex(textIndex);
    });

    return () => {
      morseAudio.setOnProgress(null);
      morseAudio.stop();
    };
  }, []);

  // Mở bộ chọn ngày và giờ (Android gọi imperative, iOS kích hoạt state)
  const showDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type === 'set' && date) setSelectedDate(date);
        },
        mode: 'date',
        is24Hour: true,
      });
    } else {
      setPickerMode('date');
    }
  };

  const showTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedTime,
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type === 'set' && date) setSelectedTime(date);
        },
        mode: 'time',
        is24Hour: true,
      });
    } else {
      setPickerMode('time');
    }
  };

  // Toggle chế độ số tắt
  const handleToggleShortNumbers = (value: boolean) => {
    setUseShortNumbers(value);
    morseAudio.setUseShortNumbers(value);
  };

  // Logic phát / Tạm dừng / Tiếp tục âm thanh Morse
  const playBoard = async () => {
    if (isComparing) resetComparison();

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
    morseAudio.setCpm(cpm);
    morseAudio.setVolume(0.5);
    setIsPlaying(true);
    setIsPaused(false);
    setHasPlayed(true);
    setActiveCompareIndex(-1);

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

  // Logic phát / Tạm dừng / Tiếp tục Đối chiếu từng ký tự
  const compareBoard = async () => {
    if (isPlaying) handleResetAudio();

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
    setActiveMorseIndex(-1);

    try {
      const orderedCharacters = groups.flatMap(group => group.split(''));

      for (let i = 0; i < orderedCharacters.length; i++) {
        if (compareSessionRef.current !== sessionId) return;

        currentCharIndexRef.current = i;
        setActiveCompareIndex(i);

        // Treo vòng lặp khi đang tạm dừng đối chiếu
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
          // Bỏ qua lỗi ngắt âm dở giữa chừng
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

      {/* Top Header Navigation */}
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
        {/* Banner Tổng quan thông số */}
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
                {cpm} chữ/phút
              </Text>
            </View>
          </View>
        </View>

        {/* 1. Component BẢNG ĐIỆN MORSE */}
        <MorseTelegraphSheet
          styles={styles}
          characterType={characterType}
          useShortNumbers={useShortNumbers}
          hasPreamble={hasPreamble}
          preambleDisplayText={preambleDisplayText}
          activeMorseIndex={activeMorseIndex}
          equalSignIndex={equalSignIndex}
          groups={groups}
          groupsPerRow={groupsPerRow}
          firstGroupStartIndex={firstGroupStartIndex}
          activeCompareIndex={activeCompareIndex}
          fullPlaybackLength={fullPlaybackText.length}
        />

        {/* 2. Component THANH ĐIỀU KHIỂN PHÁT ĐIỆN */}
        <AudioPlaybackControls
          styles={styles}
          isPlaying={isPlaying}
          isPaused={isPaused}
          hasPlayed={hasPlayed}
          isLoading={isLoading}
          onTogglePlay={playBoard}
          onResetPlay={handleResetAudio}
        />

        {/* Khu vực Đối chiếu */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Đối chiếu kết quả thu</Text>
          <Headphones size={16} color="#64748B" />
        </View>

        {/* 3. Component ĐỐI CHIẾU KẾT QUẢ THU */}
        <CompareControlCard
          styles={styles}
          compareSpeed={compareSpeed}
          onChangeSpeed={setCompareSpeed}
          isComparing={isComparing}
          isComparePaused={isComparePaused}
          hasCompared={hasCompared}
          onToggleCompare={compareBoard}
          onResetCompare={resetComparison}
        />

        {/* Khu vực Cài đặt */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cài đặt âm lượng & tốc độ</Text>
        </View>

        {/* Switch Số tắt */}
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

        {/* Slider Tần số (Pitch) */}
        {/* 1. Slider Tần số âm (Pitch) */}
        <SliderCustom
          styles={styles}
          label="Tần số âm (Pitch)"
          displayValue={`${frequency} Hz`}
          value={frequency}
          minimumValue={200}
          maximumValue={1500}
          step={10}
          minLabel="200 Hz (Trầm)"
          maxLabel="1500 Hz (Bổng)"
          onValueChange={setFrequency}
          disabled={isPlaying}
        />

        {/* Slider Tốc độ (CPM) */}
        <SliderCustom
          styles={styles}
          label="Tốc độ phát"
          displayValue={`${cpm} chữ / phút`}
          value={cpm}
          minimumValue={25}
          maximumValue={300}
          step={1}
          minLabel="25 CPM (Chậm)"
          maxLabel="300 CPM (Nhanh)"
          onValueChange={setCpm}
          disabled={isPlaying}
        />

        {/* 4. Component CÀI ĐẶT ĐẦU ĐIỆN (PREAMBLE) */}
        <PreambleConfigCard
          styles={styles}
          hasPreamble={hasPreamble}
          onTogglePreamble={setHasPreamble}
          isPlaying={isPlaying}
          nrValue={nrValue}
          onChangeNr={setNrValue}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onOpenDatePicker={showDatePicker}
          onOpenTimePicker={showTimePicker}
          preamblePlaybackText={preamblePlaybackText}
        />

        {/* DateTimePicker hiển thị modal riêng trên iOS */}
        {Platform.OS === 'ios' && pickerMode && (
          <DateTimePicker
            value={pickerMode === 'date' ? selectedDate : selectedTime}
            mode={pickerMode}
            is24Hour={true}
            display="default"
            onChange={(_event: DateTimePickerEvent, date?: Date) => {
              setPickerMode(null);
              if (date) {
                if (pickerMode === 'date') setSelectedDate(date);
                if (pickerMode === 'time') setSelectedTime(date);
              }
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ElectricBoardScreen;
