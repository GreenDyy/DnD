import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
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

const characterOptions: ReadonlyArray<{ value: CharacterType; label: string }> =
  [
    { value: 'letter', label: 'Chữ' },
    { value: 'number', label: 'Số' },
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>BẢNG ĐIỆN MORSE</Text>
      <Text style={styles.title}>Thiết lập bài luyện</Text>
      <Text style={styles.subtitle}>
        Chọn dữ liệu đầu vào trước khi tạo bảng ký tự ngẫu nhiên.
      </Text>

      <View style={styles.panel}>
        <Text style={styles.label}>SỐ NHÓM KÝ TỰ</Text>
        <TextInput
          value={groupCount}
          onChangeText={setGroupCount}
          keyboardType="number-pad"
          style={styles.input}
          placeholder="10"
        />
        <Text style={styles.helper}>Mỗi nhóm gồm 5 ký tự</Text>

        <Text style={[styles.label, styles.sectionGap]}>LOẠI KÝ TỰ</Text>
        <View style={styles.choiceRow}>
          {characterOptions.map(option => (
            <Pressable
              key={option.value}
              style={[
                styles.choice,
                characterType === option.value && styles.choiceActive,
              ]}
              onPress={() => setCharacterType(option.value)}
            >
              <Text
                style={[
                  styles.choiceText,
                  characterType === option.value && styles.choiceTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable style={styles.generateButton} onPress={handleGenerate}>
        <Text style={styles.generateButtonText}>Tạo bảng</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  eyebrow: {
    color: '#2B8A78',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.6,
  },
  sectionGap: {
    marginTop: 18,
  },
  input: {
    marginTop: 10,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  helper: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 12,
  },
  choiceRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  choice: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  choiceActive: {
    backgroundColor: '#0F172A',
  },
  choiceText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  choiceTextActive: {
    color: '#FFFFFF',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  sliderRange: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    color: '#64748B',
    fontSize: 12,
  },
  generateButton: {
    marginTop: 8,
    backgroundColor: '#22C55E',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ElectroTableScreen;
