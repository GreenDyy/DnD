import TextRecognition from '@react-native-ml-kit/text-recognition';
import { CharacterType } from '../utils/morseGenerator';

// Bảng map các lỗi nhận dạng quang học phổ biến của chữ viết tay
const NUMBER_TO_LETTER_MAP: Record<string, string> = {
  '0': 'O',
  '1': 'I',
  '2': 'Z',
  '5': 'S',
  '8': 'B',
};

const LETTER_TO_NUMBER_MAP: Record<string, string> = {
  O: '0',
  D: '0',
  Q: '0',
  I: '1',
  L: '1',
  Z: '2',
  S: '5',
  B: '8',
  G: '6',
};

/**
 * Nắn chỉnh ký tự dựa trên loại bài tập đã chọn
 */
function correctTokenByContext(token: string, type: CharacterType): string {
  if (type === 'letter') {
    // Nếu là bài CHỮ CÁI: Mọi số quét ra đều là nhận diện nhầm từ chữ cái
    return token
      .split('')
      .map(char => NUMBER_TO_LETTER_MAP[char] ?? char)
      .join('');
  }

  if (type === 'number') {
    // Nếu là bài CHỮ SỐ: Mọi chữ cái quét ra đều là nhận diện nhầm từ số
    return token
      .split('')
      .map(char => LETTER_TO_NUMBER_MAP[char] ?? char)
      .join('');
  }

  return token;
}

/**
 * Nhận diện chữ viết tay/chữ in từ ảnh chụp giấy nháp và chuẩn hóa thành chuỗi nhóm Morse
 */
export async function scanMorseSheetFromImage(
  imageUri: string,
  characterType: CharacterType = 'mixed',
): Promise<string> {
  const result = await TextRecognition.recognize(imageUri);

  if (!result || !result.text) {
    return '';
  }

  // 1. Đồng nhất toàn bộ thành in hoa ngay lập tức
  let rawText = result.text.toUpperCase();

  // 2. Xóa các ký tự phân cách / nét gạch chân học viên hay vẽ trên giấy
  rawText = rawText.replace(/[/\\|_\-—–.,:;]/g, ' ');

  // 3. Chỉ giữ lại chữ cái A-Z, số 0-9 và khoảng trắng
  rawText = rawText.replace(/[^A-Z0-9\s]/g, ' ');

  const rawTokens = rawText.split(/\s+/).filter(t => t.length > 0);

  // 4. Áp dụng sửa lỗi theo ngữ cảnh đề bài
  const correctedTokens = rawTokens.map(token =>
    correctTokenByContext(token, characterType),
  );

  // 5. Cắt/gom thành từng cụm 5 ký tự chuẩn nghiệp vụ
  const normalizedGroups: string[] = [];
  for (const token of correctedTokens) {
    if (token.length <= 5) {
      normalizedGroups.push(token);
    } else {
      for (let i = 0; i < token.length; i += 5) {
        normalizedGroups.push(token.substring(i, i + 5));
      }
    }
  }

  return normalizedGroups.join(' ');
}
