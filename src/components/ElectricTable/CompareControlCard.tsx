import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Check, Pause, RotateCcw } from 'lucide-react-native';

const COMPARE_SPEEDS = [1, 1.25, 1.5, 2] as const;
export type CompareSpeed = (typeof COMPARE_SPEEDS)[number];

interface CompareControlCardProps {
  styles: any;
  compareSpeed: CompareSpeed;
  onChangeSpeed: (speed: CompareSpeed) => void;
  isComparing: boolean;
  isComparePaused: boolean;
  hasCompared: boolean;
  onToggleCompare: () => void;
  onResetCompare: () => void;
}

// Card điều khiển tiến trình đọc đối chiếu từng chữ
export const CompareControlCard: React.FC<CompareControlCardProps> = ({
  styles,
  compareSpeed,
  onChangeSpeed,
  isComparing,
  isComparePaused,
  hasCompared,
  onToggleCompare,
  onResetCompare,
}) => {
  return (
    <View style={styles.compareCard}>
      <Text style={styles.compareDesc}>
        Sau khi đã ghi chép lại bức điện ra giấy, nhấn nút dưới đây để hệ thống đọc âm từng chữ giúp bạn dò lỗi.
      </Text>

      {/* Bộ chọn tốc độ đối chiếu */}
      <View style={styles.speedSelectorRow}>
        <Text style={styles.speedLabel}>Tốc độ đọc:</Text>
        <View style={styles.speedButtonGroup}>
          {COMPARE_SPEEDS.map(speed => (
            <TouchableOpacity
              key={speed}
              disabled={isComparing}
              activeOpacity={0.7}
              style={[
                styles.speedChip,
                compareSpeed === speed && styles.speedChipActive,
                isComparing && { opacity: 0.6 },
              ]}
              onPress={() => onChangeSpeed(speed)}
            >
              <Text
                style={[
                  styles.speedChipText,
                  compareSpeed === speed && styles.speedChipTextActive,
                ]}
              >
                {speed}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Hàng nút bấm: Bắt đầu/Tạm dừng/Tiếp tục & Reset */}
      <View style={styles.compareBtnRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.compareBtn,
            isComparing && !isComparePaused && styles.compareBtnActive,
            isComparePaused && { backgroundColor: '#F59E0B' },
          ]}
          onPress={onToggleCompare}
        >
          {isComparing && !isComparePaused ? (
            <Pause size={18} color="#FFFFFF" />
          ) : (
            <Check size={18} color="#FFFFFF" />
          )}
          <Text style={styles.compareBtnText}>
            {isComparing && !isComparePaused
              ? 'Tạm dừng đối chiếu'
              : isComparePaused
              ? 'Tiếp tục đối chiếu'
              : `Đọc đối chiếu (${compareSpeed}x)`}
          </Text>
        </TouchableOpacity>

        {hasCompared && (
          <TouchableOpacity
            accessibilityLabel="Đặt lại đối chiếu"
            activeOpacity={0.8}
            style={styles.iconButton}
            onPress={onResetCompare}
          >
            <RotateCcw size={18} color="#475569" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};