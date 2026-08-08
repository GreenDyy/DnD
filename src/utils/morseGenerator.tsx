const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';

export type PracticeMode =
  | 'letters'
  | 'numbers'
  | 'mixed';

export interface PracticeOptions {
  groups: number;
  groupLength: number;
  mode: PracticeMode;
}

function randomChar(source: string): string {
  const index = Math.floor(Math.random() * source.length);
  return source[index];
}

export function generatePracticeText(
  options: PracticeOptions,
): string {
  const {
    groups,
    groupLength,
    mode,
  } = options;

  let source = LETTERS;

  switch (mode) {
    case 'numbers':
      source = NUMBERS;
      break;

    case 'mixed':
      source = LETTERS + NUMBERS;
      break;

    default:
      source = LETTERS;
  }

  const result: string[] = [];

  for (let i = 0; i < groups; i++) {
    let group = '';

    for (let j = 0; j < groupLength; j++) {
      group += randomChar(source);
    }

    result.push(group);
  }

  return result.join(' ');
}