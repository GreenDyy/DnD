import type { CharacterType } from '.';
import { MorseBoardFile } from '../services/fileBoardService';

export type RootStackParamList = {
  SplashScreen: undefined;
  HomeScreen: undefined;
  DnDScreen: { cpm?: number };
  ElectroTableScreen: undefined;
  ElectricBoardScreen: {
    groupCount: number;
    characterType: CharacterType;
    cpm?: number;
    savedBoard: MorseBoardFile;
  };
  ChatScreen: undefined;
  PlaygroundScreen: undefined;
  SavedBoardsScreen: undefined;
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
