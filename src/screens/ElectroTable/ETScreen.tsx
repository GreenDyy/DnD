import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';

import { type RootStackParamList } from '../../navigation/AppNavigator';
import {
  MAX_GROUP_COUNT,
  MIN_GROUP_COUNT,
  type CharacterType,
} from '../../utils/morseGenerator';
import { boardStyles } from './boardStyles';

const characterOptions: ReadonlyArray<{ value: CharacterType; label: string }> =
  [
    { value: 'letter', label: 'Chữ' },
    { value: 'number', label: 'Số' },
    { value: 'shortNumber', label: 'Số tắt' },
    { value: 'mixed', label: 'Hỗn hợp' },
  ];

function ElectroTableScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [groupCount, setGroupCount] = useState('10');
  const [characterType, setCharacterType] = useState<CharacterType>('letter');

  const handleGenerate = () => {
    const normalizedValue = groupCount.trim();

    if (!/^\d+$/.test(normalizedValue)) {
      Alert.alert(
        'Dữ liệu không hợp lệ',
        `Số nhóm phải là số nguyên từ ${MIN_GROUP_COUNT} đến ${MAX_GROUP_COUNT}.`,
      );
      return;
    }

    const parsedGroupCount = Number(normalizedValue);

    if (
      !Number.isSafeInteger(parsedGroupCount) ||
      parsedGroupCount < MIN_GROUP_COUNT ||
      parsedGroupCount > MAX_GROUP_COUNT
    ) {
      Alert.alert(
        'Dữ liệu không hợp lệ',
        `Số nhóm phải nằm trong khoảng ${MIN_GROUP_COUNT} đến ${MAX_GROUP_COUNT}.`,
      );
      return;
    }

    navigation.navigate('ElectricBoardScreen', {
      groupCount: parsedGroupCount,
      characterType,
    });
  };

  return (
    <ScrollView
      style={boardStyles.setupContainer}
      contentContainerStyle={boardStyles.setupContent}
    >
      <Text style={boardStyles.setupEyebrow}>BẢNG ĐIỆN MORSE</Text>
      <Text style={boardStyles.setupTitle}>Thiết lập bài luyện</Text>
      <Text style={boardStyles.setupSubtitle}>
        Chọn dữ liệu đầu vào trước khi tạo bảng ký tự ngẫu nhiên.
      </Text>

      <View style={boardStyles.setupPanel}>
        <Text style={boardStyles.setupLabel}>SỐ NHÓM KÝ TỰ</Text>
        <TextInput
          value={groupCount}
          onChangeText={setGroupCount}
          keyboardType="number-pad"
          style={boardStyles.setupInput}
          placeholder="10"
        />
        <Text style={boardStyles.setupHelper}>Mỗi nhóm gồm 5 ký tự</Text>

        <Text style={[boardStyles.setupLabel, boardStyles.setupSectionGap]}>
          LOẠI KÝ TỰ
        </Text>
        <View style={boardStyles.setupChoiceRow}>
          {characterOptions.map(option => (
            <Pressable
              key={option.value}
              style={[
                boardStyles.setupChoice,
                characterType === option.value && boardStyles.setupChoiceActive,
              ]}
              onPress={() => setCharacterType(option.value)}
            >
              <Text
                style={[
                  boardStyles.setupChoiceText,
                  characterType === option.value &&
                    boardStyles.setupChoiceTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        style={boardStyles.setupGenerateButton}
        onPress={handleGenerate}
      >
        <Text style={boardStyles.setupGenerateButtonText}>Tạo bảng</Text>
      </Pressable>
    </ScrollView>
  );
}

export default ElectroTableScreen;
