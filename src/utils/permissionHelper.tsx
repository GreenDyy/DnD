import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

/**
 * Kiểm tra và yêu cầu cấp quyền Camera
 */
export async function requestCameraPermission(): Promise<boolean> {
  // 1. Xử lý riêng cho Android bằng API core React Native
  if (Platform.OS === 'android') {
    try {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );

      if (hasPermission) {
        return true;
      }

      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Cấp quyền Máy ảnh',
          message: 'Ứng dụng cần quyền Camera để chụp và quét bài thu Morse.',
          buttonPositive: 'Đồng ý',
          buttonNegative: 'Từ chối',
        },
      );

      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Quyền Camera bị chặn',
          'Bạn đã chặn vĩnh viễn quyền máy ảnh. Vui lòng mở Cài đặt ứng dụng để bật lại quyền.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
          ],
        );
      }

      return false;
    } catch (err) {
      console.warn('Lỗi xin quyền camera trên Android:', err);
      return false;
    }
  }

  // 2. Xử lý cho iOS
  try {
    const status = await check(PERMISSIONS.IOS.CAMERA);
    if (status === RESULTS.GRANTED) return true;

    if (status === RESULTS.DENIED) {
      const res = await request(PERMISSIONS.IOS.CAMERA);
      return res === RESULTS.GRANTED;
    }

    if (status === RESULTS.BLOCKED) {
      Alert.alert(
        'Quyền Camera bị chặn',
        'Vui lòng vào Cài đặt để cấp quyền truy cập Camera cho ứng dụng.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
        ],
      );
    }
    return false;
  } catch (err) {
    console.warn('Lỗi xin quyền camera trên iOS:', err);
    return false;
  }
}
