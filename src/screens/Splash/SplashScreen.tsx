import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { images } from '../../assets';
import { useLocalAIStore } from '../../store';

function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isReady, isLoading, error, initialize } = useLocalAIStore();
  const startTime = useRef(Date.now());
  const navigated = useRef(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (navigated.current) return;
    if (!isReady && !error) return;

    const elapsed = Date.now() - startTime.current;
    const remaining = Math.max(0, 3000 - elapsed);

    const timer = setTimeout(() => {
      navigated.current = true;
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    }, remaining);

    return () => clearTimeout(timer);
  }, [isReady, error]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={images.logo}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.success} />
          <Text style={styles.loadingText}>
            {isLoading
              ? 'Đang khởi tạo model...'
              : isReady
                ? 'Sẵn sàng!'
                : error
                  ? 'Đang tải...'
                  : 'Đang khởi tạo...'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  bg: {
    width: '100%',
    height: '100%',
    opacity: 0.25,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
  loadingWrap: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default SplashScreen;
