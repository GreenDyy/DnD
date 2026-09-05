import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { ArrowLeft, Check, Pause, Play, RotateCcw } from 'lucide-react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { morseAudio } from '../../audio/MorseAudioEngine';
import { playCharacterAudio, stopCharacterAudio } from '../../assets/audioMap';
import { generateMorseBoard } from '../../utils/morseGenerator';
import { boardStyles } from './boardStyles';
import { type RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ElectricBoardScreen'>;

const defaultBoardParams = {
  groupCount: 10,
  characterType: 'letter' as const,
  cpm: 100,
};

const ElectricBoardScreen = ({ route, navigation }: Props) => {
  const { width: screenWidth } = Dimensions.get('window');
  const usableWidth = Math.max(screenWidth - 40, 0);
  const boardGridWidth = Math.max(usableWidth - 108, 0);
  const groupAreaWidth = Math.max(boardGridWidth - 36, 0);
  const groupsPerRow = Math.max(
    1,
    Math.min(4, Math.floor((groupAreaWidth + 8) / 44)),
  );
  const groupCellWidth =
    (groupAreaWidth - (groupsPerRow - 1) * 8) / groupsPerRow;
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const compareSessionRef = useRef(0);
  const params = route.params ?? defaultBoardParams;
  const { groupCount, characterType } = params;
  const [frequency, setFrequency] = useState(600);
  const [cpm, setCpm] = useState(params.cpm ?? defaultBoardParams.cpm);
  const board = useMemo(
    () => generateMorseBoard({ groupCount, characterType }),
    [groupCount, characterType],
  );
  const groups = board.groups.slice(1, -1);

  const playBoard = async () => {
    if (isComparing) {
      return;
    }

    if (isPlaying) {
      morseAudio.pause();
      setIsPlaying(false);
      return;
    }

    morseAudio.setFrequency(frequency);
    morseAudio.setCpm(cpm);
    morseAudio.setVolume(0.5);
    setIsPlaying(true);
    setHasPlayed(true);

    try {
      await morseAudio.playText(board.groups.join(' '));
    } finally {
      setIsPlaying(false);
    }
  };

  const compareBoard = async () => {
    if (isPlaying) {
      return;
    }

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
        if (compareSessionRef.current !== sessionId) {
          return;
        }

        const normalizedChar = char.toUpperCase();
        if (!normalizedChar) {
          continue;
        }

        await playCharacterAudio(normalizedChar);
        if (compareSessionRef.current !== sessionId) {
          return;
        }
        await new Promise(resolve => {
          setTimeout(() => resolve(undefined), 180);
        });
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
    <SafeAreaView style={boardStyles.container}>
      <ScrollView
        contentContainerStyle={boardStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={boardStyles.headerRow}>
          <TouchableOpacity
            accessibilityLabel="Quay lại màn hình thiết lập"
            activeOpacity={0.8}
            disabled={isLoading}
            style={[boardStyles.backButton, isLoading && { opacity: 0.5 }]}
            onPress={() => !isLoading && navigation.goBack()}
          >
            <ArrowLeft size={20} color="#132238" />
          </TouchableOpacity>
          <Text style={boardStyles.headerLabel}>BẢNG ĐIỆN</Text>
          <View style={boardStyles.headerSpacer} />
        </View>

        <View style={boardStyles.hero}>
          <Text style={boardStyles.eyebrow}>BÀI LUYỆN MORSE</Text>
          <Text
            style={[
              boardStyles.title,
              screenWidth < 360 && boardStyles.titleSmall,
            ]}
          >
            Nghe và thu báo
          </Text>
          <Text style={boardStyles.subtitle}>
            Phát tín hiệu, ghi lại nhóm ký tự bạn nghe được và kiểm tra kết quả.
          </Text>
          <View style={boardStyles.metaRow}>
            <Text style={boardStyles.meta}>{groups.length} NHÓM</Text>
            <Text style={boardStyles.meta}>{frequency} HZ</Text>
            <Text style={boardStyles.meta}>{cpm} CHỮ / PHÚT</Text>
          </View>
        </View>

        <View style={boardStyles.settingsPanel}>
          <View style={boardStyles.settingRow}>
            <Text style={boardStyles.settingLabel}>TẦN SỐ</Text>
            <Text style={boardStyles.settingValue}>{frequency} Hz</Text>
          </View>
          <Slider
            minimumValue={100}
            maximumValue={3000}
            step={10}
            value={frequency}
            onValueChange={setFrequency}
          />
          <View style={boardStyles.rangeRow}>
            <Text style={boardStyles.rangeText}>100 Hz</Text>
            <Text style={boardStyles.rangeText}>3000 Hz</Text>
          </View>
        </View>

        <View style={boardStyles.settingsPanel}>
          <View style={boardStyles.settingRow}>
            <Text style={boardStyles.settingLabel}>TỐC ĐỘ</Text>
            <Text style={boardStyles.settingValue}>{cpm} CHỮ / PHÚT</Text>
          </View>
          <Slider
            minimumValue={5}
            maximumValue={300}
            step={5}
            value={cpm}
            onValueChange={setCpm}
          />
          <View style={boardStyles.rangeRow}>
            <Text style={boardStyles.rangeText}>5 Chữ / phút</Text>
            <Text style={boardStyles.rangeText}>300 Chữ / phút</Text>
          </View>
        </View>

        <View style={boardStyles.sectionRow}>
          <Text style={boardStyles.sectionTitle}>Bảng ký tự</Text>
          <Text style={boardStyles.sectionHint}>5 KÝ TỰ / NHÓM</Text>
        </View>

        <View style={boardStyles.boardPanel}>
          <View style={boardStyles.marker}>
            <Text style={boardStyles.markerText}>=</Text>
          </View>
          <View style={boardStyles.boardGrid}>
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
                  <View
                    key={`board-row-${rowIndex}`}
                    style={boardStyles.boardRow}
                  >
                    <View style={boardStyles.groupsInRow}>
                      {rowGroups.map((group, groupIndex) => (
                        <View
                          key={`${group}-${groupIndex}`}
                          style={[
                            boardStyles.groupCell,
                            {
                              flex: 0,
                              width: groupCellWidth,
                              minWidth: groupCellWidth,
                            },
                          ]}
                        >
                          <Text style={boardStyles.groupText}>{group}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={boardStyles.rowNumber}>{endNumber}</Text>
                  </View>
                );
              },
            )}
          </View>
          <View style={[boardStyles.marker, boardStyles.endMarker]}>
            <Text style={boardStyles.markerText}>+</Text>
          </View>
        </View>

        <View style={boardStyles.controlsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isComparing}
            style={[
              boardStyles.playButton,
              isPlaying && { backgroundColor: '#538885' },
              isComparing && { opacity: 0.5 },
            ]}
            onPress={playBoard}
          >
            {isPlaying ? (
              <Pause size={18} color="#F8FAFC" />
            ) : (
              <Play size={18} color="#F8FAFC" fill="#F8FAFC" />
            )}
            <Text style={boardStyles.playButtonText}>
              {isPlaying ? 'Tạm dừng' : 'Phát bảng'}
            </Text>
          </TouchableOpacity>
          {hasPlayed ? (
            <TouchableOpacity
              accessibilityLabel="Đặt lại bảng phát"
              activeOpacity={0.8}
              disabled={isLoading}
              style={[boardStyles.iconButton, isLoading && { opacity: 0.5 }]}
              onPress={() => {
                if (!isLoading) {
                  morseAudio.stop();
                  setIsPlaying(false);
                  setHasPlayed(false);
                }
              }}
            >
              <RotateCcw size={19} color="#132238" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={boardStyles.sectionRow}>
          <Text style={boardStyles.sectionTitle}>Tập thu báo</Text>
          <Text style={boardStyles.sectionHint}>ĐỐI CHIẾU SAU</Text>
        </View>

        <View style={boardStyles.comparePanel}>
          <Text style={boardStyles.compareHelp}>
            Ghi kết quả thu báo của bạn, sau đó đối chiếu khi sẵn sàng.
          </Text>
          <View style={boardStyles.compareActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isPlaying}
              style={[boardStyles.checkButton, isPlaying && { opacity: 0.5 }]}
              onPress={compareBoard}
            >
              {isComparing ? (
                <ActivityIndicator size="small" color="#F8FAFC" />
              ) : (
                <Check size={18} color="#F8FAFC" />
              )}
              <Text style={boardStyles.checkButtonText} numberOfLines={1}>
                {isComparing ? 'Đang đối chiếu...' : 'Đối chiếu'}
              </Text>
            </TouchableOpacity>
            {hasCompared ? (
              <TouchableOpacity
                accessibilityLabel="Đặt lại đối chiếu"
                activeOpacity={0.8}
                disabled={isComparing}
                style={[boardStyles.iconButton, isComparing && { opacity: 0.5 }]}
                onPress={resetComparison}
              >
                <RotateCcw size={19} color="#132238" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ElectricBoardScreen;
