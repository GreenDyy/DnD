import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PlayGroundScreen from '../screens/PlayGround/PlayGroundScreen';
import AIPlaygroundScreen from '../screens/PlayGround/AI/AIPlaygroundScreen';

const Stack = createNativeStackNavigator();

function PlaygroundNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlayGroundScreen" component={PlayGroundScreen} />
      <Stack.Screen name="AIPlaygroundScreen" component={AIPlaygroundScreen} />
    </Stack.Navigator>
  );
}

export default PlaygroundNavigator;
