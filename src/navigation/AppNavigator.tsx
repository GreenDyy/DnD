import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/Splash/SplashScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import DnDScreen from '../screens/DnD/DnDScreen';
import ElectroTableScreen from '../screens/ElectroTable/ETScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import AudioTestScreen from '../screens/Test/AudioTestScreen';
import AudioTest2 from '../screens/Test/AudioTest2';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="DnDScreen" component={DnDScreen} />
      <Stack.Screen name="ElectroTableScreen" component={ElectroTableScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="AudioTest" component={AudioTestScreen} />
      <Stack.Screen name="AudioTest2" component={AudioTest2} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
