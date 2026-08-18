import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import HomeCard from '../../components/HomeCard';

const cards = [
  { badge: 'HỌC', title: 'Học báo vụ', desc: 'Học bảng Morse và luyện nghe tín hiệu', color: '#E6FFFA', icon: 'book' },
  { badge: 'NGHE', title: 'Tíc Tà Sound', desc: 'Nghe và nhận dạng tín hiệu Morse', color: '#EAFBF0', icon: 'headphones', screen: 'DnDScreen' },
  { badge: 'TEST', title: 'Playground', desc: 'Thử tốc độ và chế độ phát', color: '#FFF4E5', icon: 'zap', screen: 'Playground' },
  { badge: 'T-Q', title: 'Bảng điện', desc: 'Luyện tập truyền điện và nhận điện', color: '#F3E8FF', icon: 'radio', screen: 'ElectroTableScreen' },
  { badge: 'CHAT', title: 'Trợ lý Morse', desc: 'Hỏi đáp về mã Morse', color: '#E6FFFA', icon: 'chat', screen: 'ChatScreen' },
];

function HomeScreen() {
  useEffect(() => {
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Morse Trainer</Text>
      <Text style={styles.subTitle}>
        Luyện tập và kiểm tra kỹ năng báo vụ
      </Text>

      <View style={styles.grid}>
        {cards.map((card, index) => (
          <HomeCard key={index} {...card} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  header: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
  },
  subTitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
});

export default HomeScreen;
