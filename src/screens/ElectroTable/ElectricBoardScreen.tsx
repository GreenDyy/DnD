import React, { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { ArrowLeft, Check, Pause, Play, RotateCcw } from 'lucide-react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { morseAudio } from '../../audio/MorseAudioEngine';
import { generateMorseBoard } from '../../utils/morseGenerator';
import { boardStyles } from './boardStyles';
import { type RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ElectricBoardScreen'>;

const defaultBoardParams = {
  groupCount: 10,
  characterType: 'letter' as const,
  wpm: 20,
};

const ElectricBoardScreen = ({ route, navigation }: Props) => {
  const { width: screenWidth } = Dimensions.get('window');
  const params = route.params ?? defaultBoardParams;
  const { groupCount, characterType } = params;
  const [frequency, setFrequency] = useState(600);
  const [wpm, setWpm] = useState(params.wpm ?? defaultBoardParams.wpm);
  const board = useMemo(
    () => generateMorseBoard({ groupCount, characterType }),
    [groupCount, characterType],
  );
  const groups = board.groups.slice(1, -1);

  const playBoard = async () => {
    morseAudio.setFrequency(frequency);
    morseAudio.setWpm(wpm);
    morseAudio.setVolume(0.5);
    await morseAudio.playText(board.groups.join(' '));
  };

  return (
    <SafeAreaView style={boardStyles.container}>
      <ScrollView
        contentContainerStyle={boardStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={boardStyles.headerRow}>
          <Pressable
            accessibilityLabel="Quay lại màn hình thiết lập"
            style={boardStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color="#132238" />
          </Pressable>
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
            <Text style={boardStyles.meta}>{wpm} WPM</Text>
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
            <Text style={boardStyles.settingValue}>{wpm} WPM</Text>
          </View>
          <Slider
            minimumValue={5}
            maximumValue={100}
            step={5}
            value={wpm}
            onValueChange={setWpm}
          />
          <View style={boardStyles.rangeRow}>
            <Text style={boardStyles.rangeText}>5 WPM</Text>
            <Text style={boardStyles.rangeText}>100 WPM</Text>
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
              { length: Math.ceil(groups.length / 4) },
              (_, rowIndex) => {
                const rowGroups = groups.slice(rowIndex * 4, rowIndex * 4 + 4);
                const endNumber = Math.min((rowIndex + 1) * 4, groups.length);

                return (
                  <View
                    key={`board-row-${rowIndex}`}
                    style={boardStyles.boardRow}
                  >
                    <View style={boardStyles.groupsInRow}>
                      {rowGroups.map((group, groupIndex) => (
                        <View
                          key={`${group}-${groupIndex}`}
                          style={boardStyles.groupCell}
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
          <Pressable style={boardStyles.playButton} onPress={playBoard}>
            <Play size={18} color="#F8FAFC" fill="#F8FAFC" />
            <Text style={boardStyles.playButtonText}>Phát bảng</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Tạm dừng phát"
            style={boardStyles.iconButton}
            onPress={() => morseAudio.pause()}
          >
            <Pause size={19} color="#132238" />
          </Pressable>
          <Pressable
            accessibilityLabel="Phát lại từ đầu"
            style={boardStyles.iconButton}
            onPress={() => morseAudio.restart()}
          >
            <RotateCcw size={19} color="#132238" />
          </Pressable>
        </View>

        <View style={boardStyles.sectionRow}>
          <Text style={boardStyles.sectionTitle}>Tập thu báo</Text>
          <Text style={boardStyles.sectionHint}>ĐỐI CHIẾU SAU</Text>
        </View>

        <View style={boardStyles.comparePanel}>
          <Text style={boardStyles.compareHelp}>
            Ghi kết quả thu báo của bạn, sau đó đối chiếu khi sẵn sàng.
          </Text>
          <Pressable style={boardStyles.checkButton} onPress={() => {}}>
            <Check size={18} color="#F8FAFC" />
            <Text style={boardStyles.checkButtonText}>Đối chiếu</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ElectricBoardScreen;
