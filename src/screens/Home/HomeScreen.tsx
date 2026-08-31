import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_NAME } from '../../constants/config';
import { images } from '../../assets';
import { useLocalAIStore } from '../../store';
import { HeroBanner, StatusCard, FeatureCard } from '../../components/Home';
import {
  BookOpen,
  Headphones,
  Zap,
  Radio,
  Settings,
} from 'lucide-react-native';

const features = [
  {
    id: '1',
    icon: BookOpen,
    title: 'Học Morse',
    desc: 'Bảng chữ cái và quy tắc',
    color: '#16A34A',
    bgColor: '#F0FDF4',
    screen: null,
  },
  {
    id: '2',
    icon: Headphones,
    title: 'Tíc Tà Sound',
    desc: 'Nghe và nhận dạng tín hiệu',
    color: '#22C55E',
    bgColor: '#DCFCE7',
    screen: 'DnDScreen',
  },
  {
    id: '3',
    icon: Zap,
    title: 'Playground',
    desc: 'Thử tốc độ và chế độ',
    color: '#EAB308',
    bgColor: '#FEF9C3',
    screen: 'Playground',
  },
  {
    id: '4',
    icon: Radio,
    title: 'Bảng điện',
    desc: 'Luyện truyền và nhận điện',
    color: '#15803D',
    bgColor: '#DCFCE7',
    screen: 'ElectroTableScreen',
  },
];

function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { isReady, isLoading, error } = useLocalAIStore();

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
          <View style={styles.settingsBtn}>
            <Settings size={20} color={colors.textSecondary} />
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Luyện Morse{'\n'}mọi lúc, mọi nơi</Text>
          <Text style={styles.welcomeSubtitle}>Học, nghe, luyện tập mã hiệu</Text>
        </View>

        {/* Hero Banner */}
        <HeroBanner onPress={() => navigation.navigate('ChatScreen')} />

        {/* Model Status */}
        <StatusCard isReady={isReady} isLoading={isLoading} error={error} />

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Chức năng</Text>
          <View style={styles.featuresGrid}>
            {features.map((f) => (
              <FeatureCard
                key={f.id}
                icon={f.icon}
                title={f.title}
                desc={f.desc}
                color={f.color}
                bgColor={f.bgColor}
                hasScreen={!!f.screen}
                onPress={() => f.screen && navigation.navigate(f.screen)}
              />
            ))}
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
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
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
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
  featuresSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});

export default HomeScreen;
