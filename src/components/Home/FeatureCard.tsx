import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { LucideIcon } from 'lucide-react-native';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  bgColor: string;
  hasScreen?: boolean;
  onPress?: () => void;
}

function FeatureCard({ icon: Icon, title, desc, color, bgColor, hasScreen, onPress }: FeatureCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={hasScreen ? 0.7 : 1}>
      <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{desc}</Text>
      {hasScreen && (
        <ChevronRight size={14} color={colors.textSecondary} style={styles.arrow} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  desc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  arrow: {
    position: 'absolute',
    right: 12,
    bottom: 14,
  },
});

export default FeatureCard;
