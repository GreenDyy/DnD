import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Morse Trainer</Text>
      <Text style={styles.subTitle}>
        Luyện tập và kiểm tra kỹ năng báo vụ
      </Text>

      <View style={styles.grid}>
  <TouchableOpacity style={[styles.card, styles.blueCard]}>
    <Text style={styles.badge}>HỌC</Text>
    <Text style={styles.cardTitle}>Học báo vụ</Text>
    <Text style={styles.cardDesc}>
      Học bảng Morse và luyện nghe tín hiệu
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.card, styles.greenCard]}
    onPress={() => navigation.navigate('DnDScreen')}>
    <Text style={styles.badge}>NGHE</Text>
    <Text style={styles.cardTitle}>Tíc Tà Sound</Text>
    <Text style={styles.cardDesc}>
      Nghe và nhận dạng tín hiệu Morse
    </Text>
  </TouchableOpacity>

  <TouchableOpacity style={[styles.card, styles.orangeCard]}>
    <Text style={styles.badge}>TEST</Text>
    <Text style={styles.cardTitle}>Playground</Text>
    <Text style={styles.cardDesc}>
      Thử tốc độ và chế độ phát
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.card, styles.purpleCard]}
    onPress={() => navigation.navigate('ElectroTableScreen')}>
    <Text style={styles.badge}>T-Q</Text>
    <Text style={styles.cardTitle}>Bảng điện</Text>
    <Text style={styles.cardDesc}>
      Luyện tập truyền điện và nhận điện
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.card, styles.tealCard]}
    onPress={() => navigation.navigate('ChatScreen')}>
    <Text style={styles.badge}>CHAT</Text>
    <Text style={styles.cardTitle}>Trợ lý Morse</Text>
    <Text style={styles.cardDesc}>
      Hỏi đáp về mã Morse
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.card, styles.tealCard]}
    onPress={() => navigation.navigate('AudioTest')}>
    <Text style={styles.badge}>test morse</Text>
    <Text style={styles.cardTitle}>test morse từ thiết bị</Text>
    <Text style={styles.cardDesc}>
      react-native-audio-api
    </Text>
  </TouchableOpacity>
</View>
    </View>
  );
}

const CARD_SIZE = 160;

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

card: {
  width: '47%',
  minHeight: 160,
  borderRadius: 24,
  padding: 18,
  justifyContent: 'space-between',
  elevation: 6,
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: {
    width: 0,
    height: 4,
  },
},

blueCard: {
  backgroundColor: '#E8F1FF',
},

greenCard: {
  backgroundColor: '#EAFBF0',
},

orangeCard: {
  backgroundColor: '#FFF4E5',
},

purpleCard: {
  backgroundColor: '#F3E8FF',
},

tealCard: {
  backgroundColor: '#E6FFFA',
},

badge: {
  alignSelf: 'flex-start',
  backgroundColor: 'rgba(255,255,255,0.8)',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  fontSize: 11,
  fontWeight: '700',
  color: '#444',
},

cardTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#111827',
},

cardDesc: {
  fontSize: 13,
  lineHeight: 20,
  color: '#4B5563',
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
