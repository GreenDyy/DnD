import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  Lightbulb,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { morseAudio } from '../../audio/MorseAudioEngine';
import { colors } from '../../theme';
import { icons } from '../../assets';
import Dropdown from '../../components/Common/Dropdown';

const FREQUENCY_OPTIONS = Array.from({ length: 14 }, (_, index) => {
  const value = 200 + index * 100;
  return { label: `${value} Hz`, value };
});

export default function MorseTapScreen() {
  const navigation = useNavigation();

  const [isHolding, setIsHolding] = useState(false);
  const [frequency, setFrequency] = useState(900);

  useEffect(() => {
    morseAudio.setFrequency(frequency);
  }, [frequency]);

  const handlePressIn = () => {
    setIsHolding(true);
    morseAudio.startManualTone();
  };

  const handlePressOut = () => {
    morseAudio.stopManualTone();
    setIsHolding(false);
  };

  const handleReset = () => {
    morseAudio.stopManualTone();
    setIsHolding(false);
  };

  useEffect(() => {
    return () => {
      morseAudio.stopManualTone();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <ArrowLeft size={25} color={colors.primary} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Gõ Morse</Text>
        </View>

        <Pressable onPress={handleReset} style={styles.headerButton}>
          <RotateCcw size={22} color={colors.primary} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.tapArea}>
          <View style={styles.outerRing} />

          <View style={styles.middleRing}>
            <View style={styles.tapButtonWrapper}>
              <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={({ pressed }) => [
                  styles.tapButton,
                  pressed && styles.tapButtonPressed,
                ]}
              >
                <Image source={icons.tap} style={{ width: 100, height: 100 }} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[styles.statusPill, isHolding && styles.statusPillActive]}>
          <View
            style={[styles.statusDot, isHolding && styles.statusDotActive]}
          />

          <Text style={styles.statusText}>
            {isHolding ? 'Đang phát âm thanh' : 'Sẵn sàng'}
          </Text>
        </View>

        <View style={styles.audioCard}>
          <View style={styles.audioIcon}>
            <Volume2 size={28} color={colors.primary} strokeWidth={2} />
          </View>

          <View style={styles.audioContent}>
            <Text style={styles.audioTitle}>Âm thanh Morse</Text>

            <Dropdown
              label={`Phát ở tần số ${frequency} Hz`}
              options={FREQUENCY_OPTIONS}
              selectedValue={frequency}
              onSelect={setFrequency}
            />
          </View>
        </View>

        <View style={styles.tipContainer}>
          <View style={styles.tipIcon}>
            <Lightbulb size={25} color={colors.primary} strokeWidth={2} />
          </View>

          <Text style={styles.tipText}>
            Mỗi lần nhấn nút{'\n'}
            phát một dấu chấm Morse.{'\n'}
            Hãy gõ nhịp liên tục!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FCFA',
  },

  header: {
    minHeight: 94,
    paddingHorizontal: 18,
    paddingTop: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 54,
    height: 54,

    borderRadius: 18,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#164E45',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#123B38',
    letterSpacing: -0.8,
  },

  mainContent: {
    flex: 1,

    alignItems: 'center',

    paddingHorizontal: 18,
    paddingTop: 28,
  },

  tapArea: {
    width: 330,
    height: 330,

    alignItems: 'center',
    justifyContent: 'center',
  },

  outerRing: {
    position: 'absolute',

    width: 300,
    height: 300,

    borderRadius: 150,

    backgroundColor: '#EDF9F5',

    borderWidth: 1,
    borderColor: '#D8F3E9',
  },

  middleRing: {
    width: 244,
    height: 244,

    borderRadius: 122,

    backgroundColor: '#D8F7EA',

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 7,
    borderColor: '#B9EFD9',
  },

  tapButtonWrapper: {
    width: 210,
    height: 210,
    borderRadius: 105,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tapButton: {
    width: 196,
    height: 196,

    borderRadius: 98,

    backgroundColor: '#19A873',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#0B7654',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },

  tapButtonPressed: {
    backgroundColor: '#E8F8F2',
  },

  statusPill: {
    marginTop: -4,

    minWidth: 150,
    height: 48,

    paddingHorizontal: 20,

    borderRadius: 24,

    backgroundColor: '#E4F8EF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 9,
  },

  statusPillActive: {
    backgroundColor: '#D3F5E5',
  },

  statusDot: {
    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: '#2BB987',
  },

  statusDotActive: {
    transform: [{ scale: 1.15 }],
  },

  statusText: {
    fontSize: 15,
    fontWeight: '600',

    color: '#319C78',
  },

  audioCard: {
    width: '100%',
    minHeight: 100,
    marginTop: 26,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#E9F8F2',
    flexDirection: 'row',
    alignItems: 'center',
  },

  audioIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#D0F2E4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  audioContent: {
    flex: 1,
    marginLeft: 16,
  },

  audioTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#145C50',
  },

  tipContainer: {
    marginTop: 24,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: '#E8F8F2',
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 340,
  },

  tipIcon: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: '#D2F3E5',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  tipText: {
    flex: 1,

    fontSize: 13.5,
    lineHeight: 20,

    color: '#55847B',
  },
});