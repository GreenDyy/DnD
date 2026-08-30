import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/Splash/SplashScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import DnDScreen from '../screens/DnD/DnDScreen';
import ElectroTableScreen from '../screens/ElectroTable/ETScreen';
import ElectricBoardScreen from '../screens/ElectroTable/ElectricBoardScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import { CharacterType } from '../utils/morseGenerator';

// loại param cho từng màn hình, nếu màn hình không có param thì để undefined
export type RootStackParamList = {
  SplashScreen: undefined;
  HomeScreen: undefined;
  DnDScreen: undefined;
  ElectroTableScreen: undefined;
  ElectricBoardScreen: {
    groupCount: number;
    characterType: CharacterType;
  };
  ChatScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="DnDScreen" component={DnDScreen} />
      <Stack.Screen name="ElectroTableScreen" component={ElectroTableScreen} />
      <Stack.Screen
        name="ElectricBoardScreen"
        component={ElectricBoardScreen}
      />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
