import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface SectionTitleProps {
  title: string;
  color?: string;
  style?: object;
}

function SectionTitle({ title, color = colors.text, style }: SectionTitleProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.title, { color }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
});

export default SectionTitle;
