import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface HomeCardProps {
  badge: string;
  title: string;
  desc: string;
  color: string;
  screen?: string;
}

function HomeCard(props: HomeCardProps) {
  const { badge, title, desc, color, screen } = props;
  
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: color }]}
      onPress={() => screen && navigation.navigate(screen)}
    >
      <Text style={styles.badge}>{badge}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    minHeight: 160,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '700',
    color: '#444',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4B5563',
  },
});

export default HomeCard;
