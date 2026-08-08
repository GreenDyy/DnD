import React, {useState} from 'react';
import {
  View,
  TextInput,
  StatusBar,
  useColorScheme,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {
  generatePracticeText,
  PracticeMode,
} from '../../utils/morseGenerator';
import {colors} from '../../theme';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {styles} from './styles';

function ElectroTableScreen() {
  const navigation = useNavigation<any>();
  const isDarkMode = useColorScheme() === 'dark';

  const [groups, setGroups] = useState('10');
  const [groupLength, setGroupLength] = useState('5');
  const [wpm, setWpm] = useState(20);
  const [mode, setMode] = useState<PracticeMode>('letters');

  const generateTable = () => {
    const text = generatePracticeText({
      groups: Number(groups),
      groupLength: Number(groupLength),
      mode,
    });

    navigation.navigate('PracticeScreen', {
      text,
      wpm,
      groups: Number(groups),
      groupLength: Number(groupLength),
      mode,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={styles.title}>Tạo bảng điện</Text>
          <Text style={styles.subtitle}>Chọn thông số, sau đó bắt đầu luyện tập Morse.</Text>
        </View>

        <View style={styles.iconButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Số nhóm điện</Text>
              <TextInput
                style={styles.input}
                value={groups}
                onChangeText={setGroups}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Số ký tự / nhóm</Text>
              <TextInput
                style={styles.input}
                value={groupLength}
                onChangeText={setGroupLength}
                keyboardType="numeric"
                placeholder="5"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Loại điện</Text>
              <View style={styles.modeContainer}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    mode === 'letters' && styles.modeButtonActive,
                  ]}
                  onPress={() => setMode('letters')}
                >
                  <Text
                    style={[
                      styles.modeText,
                      mode === 'letters' && styles.modeTextActive,
                    ]}
                  >
                    Chữ
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    mode === 'numbers' && styles.modeButtonActive,
                  ]}
                  onPress={() => setMode('numbers')}
                >
                  <Text
                    style={[
                      styles.modeText,
                      mode === 'numbers' && styles.modeTextActive,
                    ]}
                  >
                    Số
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    mode === 'mixed' && styles.modeButtonActive,
                  ]}
                  onPress={() => setMode('mixed')}
                >
                  <Text
                    style={[
                      styles.modeText,
                      mode === 'mixed' && styles.modeTextActive,
                    ]}
                  >
                    Hỗn hợp
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Tốc độ luyện tập</Text>
              <View style={styles.speedRow}>
                <TouchableOpacity
                  style={styles.speedControl}
                  onPress={() => setWpm(prev => Math.max(5, prev - 5))}
                >
                  <Text style={styles.speedControlText}>-</Text>
                </TouchableOpacity>

                <View style={styles.speedValueBox}>
                  <Text style={styles.speedValue}>{wpm}</Text>
                  <Text style={styles.speedLabel}>chữ / phút</Text>
                </View>

                <TouchableOpacity
                  style={styles.speedControl}
                  onPress={() => setWpm(prev => Math.min(50, prev + 5))}
                >
                  <Text style={styles.speedControlText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateTable}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="radio-tower"
              size={20}
              color="#FFF"
            />
            <Text style={styles.generateButtonText}>TẠO BẢNG ĐIỆN</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default ElectroTableScreen;
