import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookOpen, Headphones, Zap, Radio, MessageCircle } from 'lucide-react-native';

interface HomeCardProps {
  badge: string;
  title: string;
  desc: string;
  color: string;
  icon: string;
  screen?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  book: BookOpen,
  headphones: Headphones,
  zap: Zap,
  radio: Radio,
  chat: MessageCircle,
};

function HomeCard({ badge, title, desc, color, icon, screen }: HomeCardProps) {
  const navigation = useNavigation<any>();
  const IconComponent = iconMap[icon] || BookOpen;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: color }]}
      onPress={() => screen && navigation.navigate(screen)}
    >
      <View style={styles.iconWrap}>
        <IconComponent size={28} color="#111827" />
      </View>
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
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
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
