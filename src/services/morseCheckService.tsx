export interface CharDiffResult {
  expectedChar: string;
  actualChar: string;
  status: 'correct' | 'wrong' | 'missing' | 'extra';
}

export interface GroupDiffResult {
  groupIndex: number;
  expectedGroup: string;
  actualGroup: string;
  isPerfect: boolean;
  chars: CharDiffResult[];
}

export interface BoardCheckReport {
  totalChars: number;
  correctChars: number;
  wrongChars: number;
  missingChars: number;
  extraChars: number;
  accuracyRate: number; // Phần trăm chính xác (0 - 100%)
  groupResults: GroupDiffResult[];
}

/**
 * So sánh bảng điện gốc và kết quả thu được từ học viên / OCR camera
 * @param originalGroups Mảng các nhóm ký tự gốc (ví dụ: ["ASDFG", "QWERT"])
 * @param inputRaw Chuỗi văn bản thô quét từ camera hoặc nhập tay
 */
export function evaluateMorseReception(
  originalGroups: string[],
  inputRaw: string,
): BoardCheckReport {
  // 1. Chuẩn hóa chuỗi nhập: Viết hoa, xóa ký tự đặc biệt, chia theo khoảng trắng
  const cleanedInput = inputRaw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '');
  const inputTokens = cleanedInput.length > 0 ? cleanedInput.split(/\s+/) : [];

  // Gom các chuỗi bị viết liền thành các nhóm 5 ký tự chuẩn
  const inputGroups: string[] = [];
  for (const token of inputTokens) {
    if (token.length <= 5) {
      inputGroups.push(token);
    } else {
      for (let i = 0; i < token.length; i += 5) {
        inputGroups.push(token.substring(i, i + 5));
      }
    }
  }

  let totalChars = 0;
  let correctChars = 0;
  let wrongChars = 0;
  let missingChars = 0;
  let extraChars = 0;

  // 2. So khớp từng nhóm ký tự
  const groupResults: GroupDiffResult[] = originalGroups.map(
    (expected, idx) => {
      const actual = inputGroups[idx] || '';
      const maxLen = Math.max(expected.length, actual.length);
      const chars: CharDiffResult[] = [];
      let isPerfect = true;

      for (let c = 0; c < maxLen; c++) {
        const exp = expected[c] || '';
        const act = actual[c] || '';

        if (exp && act) {
          if (exp === act) {
            chars.push({
              expectedChar: exp,
              actualChar: act,
              status: 'correct',
            });
            correctChars++;
          } else {
            chars.push({ expectedChar: exp, actualChar: act, status: 'wrong' });
            wrongChars++;
            isPerfect = false;
          }
          totalChars++;
        } else if (exp && !act) {
          // Học viên ghi thiếu ký tự
          chars.push({ expectedChar: exp, actualChar: '_', status: 'missing' });
          missingChars++;
          totalChars++;
          isPerfect = false;
        } else if (!exp && act) {
          // Học viên ghi thừa ký tự trong nhóm
          chars.push({ expectedChar: '', actualChar: act, status: 'extra' });
          extraChars++;
          isPerfect = false;
        }
      }

      return {
        groupIndex: idx + 1,
        expectedGroup: expected,
        actualGroup: actual,
        isPerfect: isPerfect && expected.length === actual.length,
        chars,
      };
    },
  );

  // 3. Tính tỷ lệ chính xác (%)
  const accuracyRate =
    totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

  return {
    totalChars,
    correctChars,
    wrongChars,
    missingChars,
    extraChars,
    accuracyRate,
    groupResults,
  };
}
