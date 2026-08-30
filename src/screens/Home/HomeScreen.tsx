import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_NAME, AI_NAME } from '../../constants/config';
import { images } from '../../assets';
import { useLocalAIStore } from '../../store';
import {
  BookOpen,
  Headphones,
  Zap,
  Radio,
  ChevronRight,
  Settings,
  Brain,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react-native';

const features = [
  {
    id: '1',
    icon: BookOpen,
    title: 'Học Morse',
    desc: 'Bảng chữ cái và quy tắc',
    color: '#16A34A',
    bgColor: '#F0FDF4',
    screen: undefined as const,
  },
  {
    id: '2',
    icon: Headphones,
    title: 'Tíc Tà Sound',
    desc: 'Nghe và nhận dạng tín hiệu',
    color: '#22C55E',
    bgColor: '#DCFCE7',
    screen: 'DnDScreen' as const,
  },
  {
    id: '3',
    icon: Zap,
    title: 'Playground',
    desc: 'Thử tốc độ và chế độ',
    color: '#EAB308',
    bgColor: '#FEF9C3',
    screen: 'Playground' as const,
  },
  {
    id: '4',
    icon: Radio,
    title: 'Bảng điện',
    desc: 'Luyện truyền và nhận điện',
    color: '#15803D',
    bgColor: '#DCFCE7',
    screen: 'ElectroTableScreen' as const,
  },
];

function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { isReady, isLoading, error } = useLocalAIStore();

  const modelStatus = isReady
    ? { icon: CheckCircle2, text: 'AI sẵn sàng', color: '#16A34A', bg: '#F0FDF4' }
    : isLoading
      ? { icon: Loader2, text: 'Đang tải model...', color: '#EAB308', bg: '#FEF9C3' }
      : error
        ? { icon: AlertCircle, text: 'AI chưa sẵn sàng', color: '#DC2626', bg: '#FEF2F2' }
        : { icon: Brain, text: 'Khởi tạo AI', color: '#16A34A', bg: '#F0FDF4' };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}>

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerLeft}>
            <Image source={images.logo} style={styles.logo} />
            <View>
              <Text style={styles.appName}>{APP_NAME}</Text>
              <Text style={styles.appSubtitle}>Dot & Dash</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
            <Settings size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Luyện Morse{'\n'}mọi lúc, mọi nơi</Text>
          <Text style={styles.welcomeSubtitle}>Học, nghe, luyện tập mã hiệu</Text>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image source={images.mori} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Trợ lý AI</Text>
            <Text style={styles.heroDesc}>{AI_NAME}</Text>
          </View>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => navigation.navigate('ChatScreen')}
            activeOpacity={0.8}>
            <Text style={styles.heroBtnText}>Hỏi ngay</Text>
            <ChevronRight size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Model Status */}
        <View style={[styles.statusCard, { backgroundColor: modelStatus.bg }]}>
          <modelStatus.icon size={22} color={modelStatus.color} />
          <View style={styles.statusTextWrap}>
            <Text style={[styles.statusTitle, { color: modelStatus.color }]}>
              {modelStatus.text}
            </Text>
            <Text style={styles.statusDesc}>
              {isReady ? 'Bạn có thể hỏi bất cứ điều gì về Morse' : 'Cần model để dùng AI chat'}
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Chức năng</Text>
          <View style={styles.featuresGrid}>
            {features.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.featureCard, { backgroundColor: f.bgColor }]}
                onPress={() => f.screen && navigation.navigate(f.screen)}
                activeOpacity={0.7}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + '15' }]}>
                  <f.icon size={24} color={f.color} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
                {f.screen && (
                  <ChevronRight size={14} color={colors.textSecondary} style={styles.featureArrow} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Decorative background */}
      {/* <Image source={images.background} style={styles.bgDecor}/> */}
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
  bgDecor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    resizeMode: 'cover',
    opacity: 0.15,
    zIndex: 0,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22C55E',
    marginTop: 1,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Welcome
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    zIndex: 1,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  // Hero
  heroBanner: {
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#22C55E',
    overflow: 'hidden',
    height: 140,
    zIndex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.3,
    resizeMode: 'cover',
  },
  heroOverlay: {
    padding: 20,
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  heroBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  heroBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  // Status
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    zIndex: 1,
  },
  statusTextWrap: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  // Features
  featuresSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  featureArrow: {
    position: 'absolute',
    right: 12,
    bottom: 14,
  },
});

export default HomeScreen;
