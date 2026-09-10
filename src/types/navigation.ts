import type { CharacterType } from '../utils/morseGenerator';

export type RootStackParamList = {
  SplashScreen: undefined;
  HomeScreen: undefined;
  DnDScreen: { cpm?: number };
  ElectroTableScreen: undefined;
  ElectricBoardScreen: {
    groupCount: number;
    characterType: CharacterType;
    cpm?: number;
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
    cpm: number;
    groupCount: number;
    characterType: CharacterType;
  };
};
