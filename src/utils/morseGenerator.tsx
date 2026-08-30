export type CharacterType = 'letter' | 'number' | 'mixed';

// dữ liệu cần thiết lập cho một bảng điện
export interface MorseBoardConfig {
  groupCount: number;
  characterType: CharacterType;
}

// dữ liệu của một bảng điện đã được tạo ra
export interface MorseBoard {
  config: MorseBoardConfig;
  groups: string[];
  morse: string[];
}

// giới hạn bảng điện
export const MIN_GROUP_COUNT = 1;
export const MAX_GROUP_COUNT = 120;

// các ký tự có thể xuất hiện trong bảng điện
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const NUMBERS = '0123456789';

// Lấy tập ký tự dựa trên loại ký tự được chọn
function getCharacterPool(type: CharacterType): string {
  switch (type) {
    case 'letter':
      return LETTERS;

    case 'number':
      return NUMBERS;

    case 'mixed':
      return LETTERS + NUMBERS;

    default:
      return LETTERS;
  }
}

// Lấy một ký tự ngẫu nhiên từ tập ký tự
function randomCharacter(pool: string): string {
  const index = Math.floor(Math.random() * pool.length);

  return pool[index];
}

// Tạo một nhóm ký tự ngẫu nhiên với độ dài xác định
function generateGroup(pool: string, length: number): string {
  let result = '';

  for (let i = 0; i < length; i++) {
    result += randomCharacter(pool);
  }

  return result;
}

// Tạo một bảng điện Morse dựa trên cấu hình được cung cấp
export function generateMorseBoard(config: MorseBoardConfig): MorseBoard {
  validateMorseBoardConfig(config);

  const pool = getCharacterPool(config.characterType);
  const generatedGroups: string[] = [];

  for (let i = 0; i < config.groupCount; i++) {
    generatedGroups.push(generateGroup(pool, 5));
  }

  const groups = ['=', ...generatedGroups, '+'];

  return {
    config,
    groups,
    morse: groups.map(group => group),
  };
}

// Kiểm tra tính hợp lệ của cấu hình bảng điện
function validateMorseBoardConfig(config: MorseBoardConfig): void {
  if (
    !Number.isSafeInteger(config.groupCount) ||
    config.groupCount < MIN_GROUP_COUNT ||
    config.groupCount > MAX_GROUP_COUNT
  ) {
    throw new Error(
      `Số nhóm phải là số nguyên từ ${MIN_GROUP_COUNT} đến ${MAX_GROUP_COUNT}. ` +
        `Giá trị nhận được: ${config.groupCount}`,
    );
  }

  if (
    config.characterType !== 'letter' &&
    config.characterType !== 'number' &&
    config.characterType !== 'mixed'
  ) {
    throw new Error(`Loại ký tự không hợp lệ: ${config.characterType}`);
  }
}

export function generatePracticeText(config: MorseBoardConfig): string {
  const board = generateMorseBoard(config);

  return board.groups.slice(1, -1).join(' ');
}
