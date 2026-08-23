import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PlaygroundStackParamList } from '../types/navigation';

import PlayGroundScreen from '../screens/PlayGround/PlayGroundScreen';
import AIPlaygroundScreen from '../screens/PlayGround/AI/AIPlaygroundScreen';
import AudioPlaygroundScreen from '../screens/PlayGround/Audio/AudioPlaygroundScreen';
import AudioTest2Screen from '../screens/PlayGround/Audio/AudioTest2Screen';

const Stack = createNativeStackNavigator<PlaygroundStackParamList>();

function PlaygroundNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlayGroundScreen" component={PlayGroundScreen} />
      <Stack.Screen name="AIPlaygroundScreen" component={AIPlaygroundScreen} />
      <Stack.Screen name="AudioPlaygroundScreen" component={AudioPlaygroundScreen} />
      <Stack.Screen name="AudioTest2Screen" component={AudioTest2Screen} />
    </Stack.Navigator>
  );
}

export default PlaygroundNavigator;
