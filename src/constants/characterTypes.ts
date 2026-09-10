export const CHARACTER_OPTIONS = [
  { value: 'letter', label: 'Chữ' },
  { value: 'number', label: 'Số' },
  { value: 'shortNumber', label: 'Số tắt' },
  { value: 'mixed', label: 'Hỗn hợp' },
] as const;

//like enum
export type CharacterType = (typeof CHARACTER_OPTIONS)[number]['value'];