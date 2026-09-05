import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList as AppRootStackParamList } from '../types/navigation';

import SplashScreen from '../screens/Splash/SplashScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import DnDScreen from '../screens/DnD/DnDScreen';
import ElectroTableScreen from '../screens/ElectroTable/ETScreen';
import ElectricBoardScreen from '../screens/ElectroTable/ElectricBoardScreen';
import DrawerNavigator from './DrawerNavigator';
import PlaygroundNavigator from './PlaygroundNavigator';

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
      <Stack.Screen name="PlaygroundScreen" component={PlaygroundNavigator} />
      <Stack.Screen name="ChatScreen" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
