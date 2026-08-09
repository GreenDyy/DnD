import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { ArrowLeft, Play, Square } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import MorsePlayer from '../../audio/MorsePlayer';
import MORSE_MAP from '../../audio/morseMap';

const groups = [
  ['a', 'b', 'c', 'c', 'd'],
  ['a', 's', 'd', 'a', 'g'],
  ['f', 'e', 'n', 'g', 'm'],
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function ElectricPanel() {
  const navigation = useNavigation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(-1);
  const [currentChar, setCurrentChar] = useState(-1);
  const stopRef = useRef(false);

  const playAll = async () => {
    setIsPlaying(true);
    stopRef.current = false;

    for (let g = 0; g < groups.length; g++) {
      if (stopRef.current) break;
      setCurrentGroup(g);

      for (let c = 0; c < groups[g].length; c++) {
        if (stopRef.current) break;
        setCurrentChar(c);

        const char = groups[g][c];
        const code = MORSE_MAP[char.toUpperCase()];
        if (code) {
          await MorsePlayer.playCode(code);
        }
        await sleep(MorsePlayer.unit * 3);
      }

      setCurrentChar(-1);
      if (g < groups.length - 1 && !stopRef.current) {
        await sleep(MorsePlayer.unit * 7);
      }
    }

    setCurrentGroup(-1);
    setCurrentChar(-1);
    setIsPlaying(false);
  };

  const stopAll = () => {
    stopRef.current = true;
    MorsePlayer.stop();
    setIsPlaying(false);
    setCurrentGroup(-1);
    setCurrentChar(-1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Electric Panel</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {groups.map((group, gIndex) => (
          <View key={gIndex} style={styles.groupRow}>
            <Text style={styles.groupLabel}>Group {gIndex + 1}</Text>
            <View style={styles.charRow}>
              {group.map((char, cIndex) => {
                const isActive = currentGroup === gIndex && currentChar === cIndex;
                return (
                  <View
                    key={cIndex}
                    style={[styles.charBox, isActive && styles.charBoxActive]}
                  >
                    <Text style={[styles.charText, isActive && styles.charTextActive]}>
                      {char.toUpperCase()}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.stopBtn]}
          onPress={isPlaying ? stopAll : playAll}
        >
          {isPlaying ? (
            <Square size={28} color={colors.white} />
          ) : (
            <Play size={28} color={colors.white} />
          )}
          <Text style={styles.playBtnText}>{isPlaying ? 'Stop' : 'Play'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  groupRow: {
    marginBottom: 24,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  charRow: {
    flexDirection: 'row',
    gap: 8,
  },
  charBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  charBoxActive: {
    backgroundColor: '#E6FFFA',
    borderColor: colors.primary,
  },
  charText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  charTextActive: {
    color: colors.primary,
  },
  footer: {
    padding: 20,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  stopBtn: {
    backgroundColor: colors.error,
  },
  playBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});

export default ElectricPanel;
