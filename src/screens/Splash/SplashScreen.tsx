import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  Image,
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
  const { isWarmedUp, isLoading, isReady, error, initialize } = useLocalAIStore();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const progressAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1700,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    );

    progressAnimation.start();

    return () => {
      progressAnimation.stop();
    };
  }, [progress]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isWarmedUp && !error) return;

    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
  }, [isWarmedUp, error, navigation]);

  const getLoadingText = () => {
    if (isWarmedUp) return 'Học nào!';
    if (isLoading && !isReady) return 'Đang tải mô hình...';
    if (isLoading) return 'Đang tạo cache...';
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

        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>
            {getLoadingText()}
          </Text>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['12%', '92%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.loadingHint}>MORI AI / DND</Text>
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
  loadingWrap: {
    marginTop: 30,
    alignItems: 'center',
  },
  progressTrack: {
    width: 180,
    height: 4,
    marginTop: 18,
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: '#DCFCE7',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.success,
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
