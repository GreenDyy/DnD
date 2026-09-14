import type { CharacterType } from '../types';

export const CHARACTER_OPTIONS: { value: CharacterType; label: string }[] = [
  { value: 'letter', label: 'chữ cái' },
  { value: 'number', label: 'chữ số' },
  { value: 'shortNumber', label: 'chữ số tắt' },
  { value: 'mixed', label: 'hỗn hợp' },
];
