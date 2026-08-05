import React from 'react';
import { View, StyleSheet } from 'react-native';// TODO: Cài @react-navigation/native và stack/tab navigator
import HomeScreen from '../screens/Home/HomeScreen';
import DnDScreen from '../screens/DnD/DnDScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/Profile';
import { createStaticNavigation } from '@react-navigation/native';
function AppNavigator() {
  console.log("HomeScreen render");

  return (
    <View style={styles.container}>
      <DnDScreen />
    </View>
  );
}

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: {title: 'Welcome'},
    },
    Profile: {
      screen: DnDScreen,
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppNavigator;
