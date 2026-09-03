/**
 * Bản đồ chuẩn của chữ cái / số sang mã Morse.
 * Ví dụ: A -> .-, O -> --- , 1 -> .----
 */
export const MORSE_MAP: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',

  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',

  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  '/': '-..-.',
  '@': '.--.-.',
};

/**
 * Bản đồ rút gọn cho kiểu số tắt.
 * Chỉ các chữ số đặc biệt 0, 1, 2, 8, 9 được thay đổi;
 * các số còn lại giữ nguyên theo mã Morse chuẩn.
 */
export const SHORT_NUMBER_MORSE_MAP: Record<string, string> = {
  ...MORSE_MAP,
  '0': '-',
  '1': '.-',
  '2': '..-',
  '8': '-..',
  '9': '-.',
};

/**
 * Chuyển một chuỗi văn bản thành chuỗi Morse.
 * Ví dụ: "SOS" => "... --- ..."
 *
 * @param text - Chuỗi cần chuyển, ví dụ "HELLO"
 * @param mode - 'standard' dùng mã Morse chuẩn, 'shortNumber' dùng dạng số tắt
 * @returns Chuỗi Morse ngăn cách bằng khoảng trắng, dấu '/' cho khoảng cách từ
 */
export function textToMorse(
  text: string,
  mode: 'standard' | 'shortNumber' = 'standard',
): string {
  const map = mode === 'shortNumber' ? SHORT_NUMBER_MORSE_MAP : MORSE_MAP;

  return text
    .toUpperCase()
    .split('')
    .map(char => {
      if (char === ' ') {
        return '/';
      }

      return map[char] ?? '';
    })
    .filter(Boolean)
    .join(' ');
}
