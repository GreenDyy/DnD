import { Text, View } from 'react-native';
import React from 'react';
import Slider from '@react-native-community/slider';

interface SliderCustomProps {
  styles: any;
  label: string;
  displayValue: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  minLabel: string;
  maxLabel: string;
  onValueChange: (val: number) => void;
  disabled?: boolean;
}

export const SliderCustom: React.FC<SliderCustomProps> = ({
  styles,
  label,
  displayValue,
  value,
  minimumValue,
  maximumValue,
  step,
  minLabel,
  maxLabel,
  onValueChange,
  disabled = false,
}) => {
  return (
    <View style={styles.sliderCard}>
      {/* Header: Tiêu đề slider và giá trị hiện tại */}
      <View style={styles.sliderHead}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{displayValue}</Text>
      </View>

      {/* Thanh trượt điều chỉnh */}
      <Slider
        disabled={disabled}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        minimumTrackTintColor="#4F46E5"
        maximumTrackTintColor="#E2E8F0"
        thumbTintColor="#4F46E5"
        onValueChange={onValueChange}
      />

      {/* Nhãn hiển thị 2 đầu dải giá trị min / max */}
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeSub}>{minLabel}</Text>
        <Text style={styles.rangeSub}>{maxLabel}</Text>
      </View>
    </View>
  );
};
