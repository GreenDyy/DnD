import type { CharacterType } from '../utils/morseGenerator';

export type RootStackParamList = {
  SplashScreen: undefined;
  HomeScreen: undefined;
  DnDScreen: undefined;
  ElectroTableScreen: undefined;
  ChatScreen: undefined;
  Playground: undefined;
};

export type PlaygroundStackParamList = {
  PlayGroundScreen: undefined;
  AIPlaygroundScreen: undefined;
  AudioPlaygroundScreen: undefined;
  AudioTest2Screen: {
    frequency: number;
    wpm: number;
    groupCount: number;
    characterType: CharacterType;
  };
  MQTTPlaygroundScreen: undefined;
  CameraPlaygroundScreen: undefined;
};
