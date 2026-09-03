import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Volume2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { morseAudio } from '../../audio/MorseAudioEngine';
import MORSE_MAP from '../../audio/morseMap';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'DnDScreen'>;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const numbers = '0123456789'.split('');
const specials = ['.', ',', '?', '/', '=', '+', '-', '@'];

function DnDScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const speed = route.params?.speed ?? 10;

  const handlePress = async (char: string) => {
    await morseAudio.start();
    morseAudio.setWpm(speed);
    morseAudio.setFrequency(600);
    morseAudio.setVolume(1);
    await morseAudio.playText(char);
  };

  const renderCharButton = (char: string) => {
    const code = MORSE_MAP[char.toUpperCase() as keyof typeof MORSE_MAP] || '';
    return (
      <TouchableOpacity
        key={char}
        style={styles.charBtn}
        onPress={() => handlePress(char)}
        activeOpacity={0.7}>
        <Text style={styles.charLetter}>{char}</Text>
        <Text style={styles.charMorse}>{code}</Text>
        <Volume2 size={12} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TÍC TÀ SOUND</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>

        {/* Letters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: '#16A34A' }]} />
            <Text style={styles.sectionTitle}>Chữ cái</Text>
          </View>
          <View style={styles.charGrid}>
            {letters.map(renderCharButton)}
          </View>
        </View>

        {/* Numbers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: '#EAB308' }]} />
            <Text style={styles.sectionTitle}>Số</Text>
          </View>
          <View style={styles.charGrid}>
            {numbers.map(renderCharButton)}
          </View>
        </View>

        {/* Specials */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.sectionTitle}>Ký hiệu đặc biệt</Text>
          </View>
          <View style={styles.charGrid}>
            {specials.map(renderCharButton)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  charGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  charBtn: {
    width: '22%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  charLetter: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  charMorse: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
  },
});

export default DnDScreen;
