import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  disabledBack?: boolean;
  rightAction?: ReactNode; // Icon hoặc nút bấm bên phải tùy ý
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  disabledBack = false,
  rightAction,
}) => {
  return (
    <View style={styles.navBar}>
      {/* Nút quay lại bên trái */}
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabledBack}
        style={[styles.actionButton, disabledBack && styles.disabledButton]}
        onPress={onBack}
      >
        <ArrowLeft size={20} color={Colors.neutral.textPrimary} />
      </TouchableOpacity>

      {/* Tiêu đề căn giữa */}
      <Text style={styles.navTitle} numberOfLines={1}>
        {title}
      </Text>

      {/* Hành động bên phải (hoặc khoảng trống giữ cân đối layout) */}
      <View style={styles.rightWrapper}>
        {rightAction ? rightAction : <View style={styles.actionPlaceholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.divider,
    backgroundColor: Colors.neutral.background,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
    letterSpacing: 0.4,
    paddingHorizontal: 8,
  },
  rightWrapper: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPlaceholder: {
    width: 38,
    height: 38,
  },
});