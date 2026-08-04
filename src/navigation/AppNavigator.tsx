import React from 'react';
import { View, StyleSheet } from 'react-native';// TODO: Cài @react-navigation/native và stack/tab navigator
import HomeScreen from '../screens/Home/HomeScreen';
function AppNavigator() {
  return (
    <View style={styles.container}>
      <HomeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppNavigator;
