import React from 'react';
import {
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import { formatDatePart, formatTimePart } from '../../utils/preambleHelper';

interface PreambleConfigCardProps {
  styles: any;
  hasPreamble: boolean;
  onTogglePreamble: (value: boolean) => void;
  isPlaying: boolean;
  nrValue: string;
  onChangeNr: (text: string) => void;
  selectedDate: Date;
  selectedTime: Date;
  onOpenDatePicker: () => void;
  onOpenTimePicker: () => void;
  preamblePlaybackText: string;
}

// Card cài đặt Đầu điện (Bật/tắt, chỉnh NR, chọn Ngày và Giờ)
export const PreambleConfigCard: React.FC<PreambleConfigCardProps> = ({
  styles,
  hasPreamble,
  onTogglePreamble,
  isPlaying,
  nrValue,
  onChangeNr,
  selectedDate,
  selectedTime,
  onOpenDatePicker,
  onOpenTimePicker,
  preamblePlaybackText,
}) => {
  return (
    <View style={styles.preambleConfigCard}>
      {/* Switch bật/tắt đầu điện */}
      <View style={styles.toggleCard}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleTitle}>Phát kèm đầu điện</Text>
          <Text style={styles.toggleDesc}>
            Lặp lại 2 lần: NR - Số nhóm - Ngày - Giờ
          </Text>
        </View>
        <Switch
          value={hasPreamble}
          onValueChange={onTogglePreamble}
          disabled={isPlaying}
          trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
          thumbColor={hasPreamble ? '#4F46E5' : '#F8FAFC'}
        />
      </View>

      {/* Form chi tiết khi bật đầu điện */}
      {hasPreamble && (
        <View style={styles.preambleForm}>
          {/* Nhập số điện NR */}
          <View style={styles.preambleInputRow}>
            <Text style={styles.preambleFieldLabel}>Số điện (NR):</Text>
            <TextInput
              value={nrValue}
              onChangeText={onChangeNr}
              placeholder="01/HL"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              editable={!isPlaying}
              style={styles.preambleTextInput}
            />
          </View>

          {/* Chọn ngày và giờ */}
          <View style={styles.dateTimeActionRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isPlaying}
              style={styles.pickerTriggerBtn}
              onPress={onOpenDatePicker}
            >
              <Calendar size={14} color="#4F46E5" />
              <Text style={styles.pickerTriggerText}>
                Ngày: {formatDatePart(selectedDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isPlaying}
              style={styles.pickerTriggerBtn}
              onPress={onOpenTimePicker}
            >
              <Clock size={14} color="#4F46E5" />
              <Text style={styles.pickerTriggerText}>
                Giờ: {formatTimePart(selectedTime)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chuỗi phát mẫu thực tế x2 */}
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Trình tự phát x2:</Text>
            <Text style={styles.previewText}>{preamblePlaybackText}</Text>
          </View>
        </View>
      )}
    </View>
  );
};