import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_NAME } from '../../constants/config';
import { images } from '../../assets';
import {
  BookOpen,
  Headphones,
  Zap,
  Radio,
  MessageCircle,
  ChevronRight,
} from 'lucide-react-native';

const cards = [
  {
    id: '1',
    badge: 'HỌC',
    title: 'Học báo vụ',
    desc: 'Học bảng Morse và luyện nghe tín hiệu',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    icon: BookOpen,
    screen: undefined,
  },
  {
    id: '2',
    badge: 'NGHE',
    title: 'Tíc Tà Sound',
    desc: 'Nghe và nhận dạng tín hiệu Morse',
    color: '#22C55E',
    bgColor: '#F0FDF4',
    icon: Headphones,
    screen: 'DnDScreen',
  },
  {
    id: '3',
    badge: 'TEST',
    title: 'Playground',
    desc: 'Thử tốc độ và chế độ phát',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    icon: Zap,
    screen: 'Playground',
  },
  {
    id: '4',
    badge: 'T-Q',
    title: 'Bảng điện',
    desc: 'Luyện tập truyền điện và nhận điện',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    icon: Radio,
    screen: 'ElectroTableScreen',
  },
  {
    id: '5',
    badge: 'CHAT',
    title: 'Trợ lý AI',
    desc: 'Hỏi đáp về mã Morse với AI',
    color: '#06B6D4',
    bgColor: '#ECFEFF',
    icon: MessageCircle,
    screen: 'ChatScreen',
  },
];

function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.logoRow}>
            <Image source={images.logo} style={styles.logo} />
            <View style={styles.logoTextWrap}>
              <Text style={styles.title}>{APP_NAME}</Text>
              <Text style={styles.subtitle}>Dot and Dash</Text>
            </View>
          </View>
          <Text style={styles.tagline}>Luyện tập báo vụ mọi lúc, mọi nơi</Text>
        </View>

        {/* Cards Grid */}
        <View style={styles.grid}>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.card, { backgroundColor: card.bgColor }]}
              onPress={() => card.screen && navigation.navigate(card.screen)}
              activeOpacity={0.7}>
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: card.color + '15' }]}>
                  <card.icon size={24} color={card.color} />
                </View>
                <View style={[styles.badge, { backgroundColor: card.color + '20' }]}>
                  <Text style={[styles.badgeText, { color: card.color }]}>{card.badge}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDesc}>{card.desc}</Text>
                {card.screen && (
                  <View style={styles.cardArrow}>
                    <ChevronRight size={16} color={colors.textSecondary} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  // Header
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  logoTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginTop: 2,
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 16,
    lineHeight: 18,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: '47%',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardBottom: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  cardArrow: {
    position: 'absolute',
    right: 0,
    bottom: 24,
  },
});

export default HomeScreen;
