import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Morse Trainer</Text>
      <Text style={styles.subTitle}>
        Luyện tập và kiểm tra kỹ năng báo vụ
      </Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: '#EBF5FF' }]}>
            <Icon name="book-open" size={28} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Học báo vụ</Text>
          <Text style={styles.cardDesc}>Học bảng Morse và luyện nghe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            navigation.navigate('DnDScreen');
          }}>
          <View style={[styles.iconWrap, { backgroundColor: '#F0FDF4' }]}>
            <Icon name="headphones" size={28} color={colors.success} />
          </View>
          <Text style={styles.cardTitle}>Tíc Tà Sound</Text>
          <Text style={styles.cardDesc}>Nghe và nhận dạng tín hiệu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
            <Icon name="zap" size={28} color="#D97706" />
          </View>
          <Text style={styles.cardTitle}>Playground</Text>
          <Text style={styles.cardDesc}>Thử tốc độ và chế độ phát</Text>
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

  header: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },

  subTitle: {
    marginTop: 8,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 40,
  },

  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  card: {
    width: '30%',
    height: CARD_SIZE,
    borderRadius: 20,
    backgroundColor: colors.white,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },

  cardDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

export default HomeScreen;
