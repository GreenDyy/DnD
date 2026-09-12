import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';

import { type RootStackParamList } from '../../types/navigation';
import {
  MAX_GROUP_COUNT,
  MIN_GROUP_COUNT,
} from '../../utils/morseGenerator';
import type { CharacterType } from '../../types';
import { electroStyles } from './electroStyles';

interface CharacterOption {
  value: CharacterType;
  label: string;
  desc: string;
}

const characterOptions: ReadonlyArray<CharacterOption> = [
  { value: 'letter', label: 'Chữ cái', desc: 'A - Z' },
  { value: 'number', label: 'Chữ số', desc: '0 - 9' },
  { value: 'mixed', label: 'Hỗn hợp', desc: 'Chữ & Số' },
];

const PRESET_COUNTS = [30, 50, 75, 100];

export default function ElectroTableScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [groupCount, setGroupCount] = useState('10');
  const [characterType, setCharacterType] = useState<CharacterType>('letter');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleGenerate = async () => {
    if (isLoading) return;

    const normalizedValue = groupCount.trim();
    const parsedGroupCount = Number(normalizedValue);

    if (
      !/^\d+$/.test(normalizedValue) ||
      !Number.isSafeInteger(parsedGroupCount) ||
      parsedGroupCount < MIN_GROUP_COUNT ||
      parsedGroupCount > MAX_GROUP_COUNT
    ) {
      Alert.alert(
        'Số nhóm chưa đúng',
        `Vui lòng nhập một số nguyên trong khoảng từ ${MIN_GROUP_COUNT} đến ${MAX_GROUP_COUNT}.`,
      );
      return;
    }

    setIsLoading(true);
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 300));
      navigation.navigate('ElectricBoardScreen', {
        groupCount: parsedGroupCount,
        characterType,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={electroStyles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={electroStyles.keyboardAvoid}
      >
        {/* Top App Bar */}
        <View style={electroStyles.navBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isLoading}
            onPress={() => navigation.canGoBack() && navigation.goBack()}
            style={electroStyles.backButton}
          >
            <ArrowLeft size={20} color="#132238" />
          </TouchableOpacity>
          <Text style={electroStyles.navBarTitle}>Thiết lập bài luyện</Text>
          <View style={electroStyles.navBarPlaceholder} />
        </View>

        <ScrollView
          style={electroStyles.container}
          contentContainerStyle={electroStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Banner */}
          <View style={electroStyles.header}>
            <View style={electroStyles.badge}>
              <Text style={electroStyles.badgeText}>BẢNG ĐIỆN MORSE</Text>
            </View>
            <Text style={electroStyles.heroTitle}>Cấu hình đề luyện</Text>
            <Text style={electroStyles.heroSubtitle}>
              Tùy chỉnh số lượng nhóm và định dạng mã Morse ngẫu nhiên trước khi
              bắt đầu.
            </Text>
          </View>

          {/* Form Panel */}
          <View style={electroStyles.card}>
            {/* Field 1: Group count */}
            <View style={electroStyles.fieldGroup}>
              <View style={electroStyles.fieldHeader}>
                <Text style={electroStyles.fieldLabel}>Số nhóm ký tự</Text>
                <Text style={electroStyles.fieldBadge}>5 ký tự / nhóm</Text>
              </View>

              <TextInput
                value={groupCount}
                onChangeText={setGroupCount}
                keyboardType="number-pad"
                editable={!isLoading}
                maxLength={4}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                style={[
                  electroStyles.input,
                  isInputFocused && electroStyles.inputFocused,
                  isLoading && electroStyles.inputDisabled,
                ]}
                placeholder="10"
                placeholderTextColor="#94A3B8"
              />

              {/* Quick Preset Buttons */}
              <View style={electroStyles.presetRow}>
                {PRESET_COUNTS.map(count => (
                  <TouchableOpacity
                    key={count}
                    disabled={isLoading}
                    activeOpacity={0.7}
                    style={[
                      electroStyles.presetChip,
                      groupCount === String(count) &&
                        electroStyles.presetChipActive,
                    ]}
                    onPress={() => setGroupCount(String(count))}
                  >
                    <Text
                      style={[
                        electroStyles.presetChipText,
                        groupCount === String(count) &&
                          electroStyles.presetChipTextActive,
                      ]}
                    >
                      {count} nhóm
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={electroStyles.divider} />

            {/* Field 2: Character Type */}
            <View style={electroStyles.fieldGroup}>
              <Text style={electroStyles.fieldLabel}>Loại ký tự bài tập</Text>

              <View style={electroStyles.gridOptions}>
                {characterOptions.map(option => {
                  const isSelected = characterType === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.8}
                      disabled={isLoading}
                      onPress={() => setCharacterType(option.value)}
                      style={[
                        electroStyles.optionCard,
                        isSelected && electroStyles.optionCardActive,
                        isLoading && electroStyles.optionCardDisabled,
                      ]}
                    >
                      <View style={electroStyles.radioIndicator}>
                        {isSelected && <View style={electroStyles.radioDot} />}
                      </View>
                      <View style={electroStyles.optionTextWrapper}>
                        <Text
                          style={[
                            electroStyles.optionTitle,
                            isSelected && electroStyles.optionTitleActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text style={electroStyles.optionDesc}>
                          {option.desc}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Floating Bottom Action */}
        <View style={electroStyles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isLoading}
            style={[
              electroStyles.submitButton,
              isLoading && electroStyles.submitButtonDisabled,
            ]}
            onPress={handleGenerate}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={electroStyles.submitButtonText}>
                Tạo bảng bài tập →
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
