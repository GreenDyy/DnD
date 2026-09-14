export type ApiError = {
  message: string;
  statusCode?: number;
};

export type Nullable<T> = T | null;

export type CharacterType = 'letter' | 'number' | 'shortNumber' | 'mixed';

export type {
  RootStackParamList,
  PlaygroundStackParamList,
} from './navigation';
