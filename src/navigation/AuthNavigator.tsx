import React from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from '../screens/Login/LoginScreen';

// TODO: Cài @react-navigation/native và stack navigator
function AuthNavigator() {
  return (
    <View style={styles.container}>
      <LoginScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AuthNavigator;
