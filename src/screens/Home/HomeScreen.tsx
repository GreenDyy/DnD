import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { aa } from '../../utils';
import { useNavigation } from '@react-navigation/native';

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
          <Text style={styles.cardTitle}>Học báo vụ</Text>
          <Text style={styles.cardDesc}>
            Học bảng Morse và luyện nghe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}
          onPress={() => {
            console.log("dasdadadadasda")
            Alert.alert("Chức năng đang phát triển", "Chức năng này đang được phát triển. Vui lòng quay lại sau.", [
              { text: "OK" }
            ]);
          }}>
          <Text style={styles.cardTitle}>Playground</Text>
          <Text style={styles.cardDesc}>
            Thử tốc độ và các chế độ phát
          </Text>
        </TouchableOpacity>

         <TouchableOpacity style={styles.card}
          onPress={() => {
            navigation.navigate
          }}>
          <Text style={styles.cardTitle}>Tíc Tà Sound</Text>
          <Text style={styles.cardDesc}>
            Test
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

  header: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },

  subTitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#7A7A7A',
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
    backgroundColor: '#FFFFFF',
    padding: 18,

    justifyContent: 'space-between',

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  icon: {
    fontSize: 42,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

  cardDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default HomeScreen;