import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { images } from '../../assets';
import { useLocalAIStore } from '../../store';

function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isWarmedUp, isLoading, isReady, error, initialize } = useLocalAIStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (error) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
      return;
    }

    if (!isWarmedUp) return;

    const navigationTimeout = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    }, 1500);

    return () => clearTimeout(navigationTimeout);
  }, [isWarmedUp, error, navigation]);

  const getLoadingText = () => {
    if (isWarmedUp) return 'Mọi thứ đã sẵn sàng, cùng bắt đầu nhé!';
    if (isLoading && !isReady) return 'Đang tải mô hình...';
    if (isLoading) return 'Đang khởi tạo...';
    if (error) return 'Đang tải...';

    return 'Đang khởi tạo...';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={images.logo}
          style={styles.logo}
          resizeMode="contain"
        />

        {isWarmedUp && (
          <LottieView
            source={require('../../assets/animations/tick-mark.json')}
            autoPlay
            loop={false}
            style={styles.readyAnimation}
          />
        )}

        <View style={styles.loadingWrap}>
          {!isWarmedUp && (
            <LottieView
              source={require('../../assets/animations/loading.json')}
              autoPlay
              loop
              style={styles.loadingAnimation}
            />
          )}
          <Text style={styles.loadingText}>
            {getLoadingText()}
          </Text>
          {!isWarmedUp && (
            <Text style={styles.loadingHint}>MORI AI / DND</Text>
          )}
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
    ...StyleSheet.absoluteFill,
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
  readyAnimation: {
    width: 180,
    height: 180,
  },
  loadingWrap: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingAnimation: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  loadingHint: {
    marginTop: 12,
    fontSize: 10,
    letterSpacing: 2,
    color: '#94A3B8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default SplashScreen;
