import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Home,
  MessageCircle,
  Headphones,
  Zap,
  Settings,
  X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { images } from '../../assets';
import { Image } from 'react-native';

interface DrawerItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isActive?: boolean;
}

function DrawerItem({ icon, label, onPress, isActive }: DrawerItemProps) {
  return (
    <TouchableOpacity
      style={[styles.drawerItem, isActive && styles.drawerItemActive]}
      onPress={onPress}
      activeOpacity={0.7}>
      {icon}
      <Text style={[styles.drawerItemText, isActive && styles.drawerItemTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface CustomDrawerContentProps {
  navigation: any;
  state: any;
}

export default function CustomDrawerContent({ navigation: drawerNav, state }: CustomDrawerContentProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index]?.name;

  const handleNavigate = (screen: string) => {
    drawerNav.closeDrawer();
    if (screen === 'HomeScreen') {
      navigation.reset({ index: 0, routes: [{ name: 'HomeScreen' }] });
    } else {
      navigation.navigate(screen as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={images.mori} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.appName}>DnD</Text>
          <Text style={styles.appSubtitle}>Dot & Dash</Text>
        </View>
        {/* <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => drawerNav.closeDrawer()}>
          <X size={20} color={colors.textSecondary} />
        </TouchableOpacity> */}
      </View>

      <View style={styles.divider} />

      <View style={styles.menu}>
        <DrawerItem
          icon={<Home size={22} color={currentRoute === 'HomeScreen' ? colors.primary : colors.textSecondary} />}
          label="Trang chủ"
          onPress={() => handleNavigate('HomeScreen')}
          isActive={currentRoute === 'HomeScreen'}
        />
        <DrawerItem
          icon={<MessageCircle size={22} color={currentRoute === 'ChatScreen' ? colors.primary : colors.textSecondary} />}
          label="Chat AI"
          onPress={() => handleNavigate('ChatScreen')}
          isActive={currentRoute === 'ChatScreen'}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.menu}>
        <DrawerItem
          icon={<Settings size={22} color={colors.textSecondary} />}
          label="Cài đặt"
          onPress={() => {}}
        />
      </View>

      <View style={[styles.footer, { bottom: insets.bottom + 20 }]}>
        <Text style={styles.footerText}>Morse Training App</Text>
        <Text style={styles.footerVersion}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerText: {
    flex: 1,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  appSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  menu: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 14,
    marginBottom: 4,
  },
  drawerItemActive: {
    backgroundColor: '#F0FDF4',
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  drawerItemTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  footerVersion: {
    fontSize: 12,
    color: '#CBD5E1',
  },
});
