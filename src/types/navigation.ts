import type { CharacterType } from '../utils/morseGenerator';

export type RootStackParamList = {
  SplashScreen: undefined;
  HomeScreen: undefined;
  DnDScreen: undefined;
  ElectroTableScreen: undefined;
  ElectricBoardScreen: {
    groupCount: number;
    characterType: CharacterType;
    numberFormat?: 'short' | 'normal';
    wpm?: number;
  };
  ChatScreen: undefined;
  PlaygroundScreen: undefined;

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
