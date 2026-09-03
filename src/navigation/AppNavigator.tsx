import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList as AppRootStackParamList } from '../types/navigation';

import SplashScreen from '../screens/Splash/SplashScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import DnDScreen from '../screens/DnD/DnDScreen';
import ElectroTableScreen from '../screens/ElectroTable/ETScreen';
import ElectricBoardScreen from '../screens/ElectroTable/ElectricBoardScreen';
import PlayGroundScreen from '../screens/PlayGround/PlayGroundScreen';
import ChatScreen from '../screens/Chat/ChatScreen';

export type RootStackParamList = AppRootStackParamList;

const Stack = createNativeStackNavigator<AppRootStackParamList>();

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
      <Stack.Screen name="Playground" component={PlayGroundScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
