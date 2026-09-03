import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, AlertCircle, Loader2, Brain } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface StatusCardProps {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

function StatusCard({ isReady, isLoading, error }: StatusCardProps) {
  const status = isReady
    ? { icon: CheckCircle2, text: 'AI sẵn sàng', color: '#16A34A', bg: '#F0FDF4', desc: 'Bạn có thể hỏi bất cứ điều gì về Morse' }
    : isLoading
      ? { icon: Loader2, text: 'Đang tải model...', color: '#EAB308', bg: '#FEF9C3', desc: 'Vui lòng chờ trong giây lát' }
      : error
        ? { icon: AlertCircle, text: 'AI chưa sẵn sàng', color: '#DC2626', bg: '#FEF2F2', desc: 'Cần model để dùng AI chat' }
        : { icon: Brain, text: 'Khởi tạo AI', color: '#16A34A', bg: '#F0FDF4', desc: 'Cần model để dùng AI chat' };

  return (
    <View style={[styles.container, { backgroundColor: status.bg }]}>
      <status.icon size={22} color={status.color} />
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: status.color }]}>{status.text}</Text>
        <Text style={styles.desc}>{status.desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  desc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default StatusCard;
