import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { type CharacterType } from '../utils/morseGenerator';

// Thư mục lưu trữ riêng biệt của app
const BOARDS_DIR = `${RNFS.DocumentDirectoryPath}/morse_boards`;

// Định dạng chuẩn của 1 file đề Morse
export interface MorseBoardFile {
  version: number;
  id: string;
  title: string;
  createdAt: number;
  config: {
    groupCount: number;
    characterType: CharacterType;
    useShortNumbers: boolean;
    hasPreamble: boolean;
    nrValue: string;
    dateISO: string;
    timeISO: string;
  };
  groups: string[]; // Danh sách các nhóm 5 ký tự
}

// Khởi tạo thư mục nếu chưa tồn tại
async function ensureDirectoryExists(): Promise<void> {
  const exists = await RNFS.exists(BOARDS_DIR);
  if (!exists) {
    await RNFS.mkdir(BOARDS_DIR);
  }
}

/**
 * 1. Lưu bảng điện thành một file độc lập (.json hoặc .morse)
 */
export async function saveBoardToFile(
  boardData: Omit<MorseBoardFile, 'id' | 'createdAt' | 'version'>,
): Promise<MorseBoardFile> {
  await ensureDirectoryExists();

  const id = Date.now().toString();
  const fileData: MorseBoardFile = {
    ...boardData,
    version: 1,
    id,
    createdAt: Date.now(),
  };

  // Tên file chuẩn hóa theo ID
  const filePath = `${BOARDS_DIR}/board_${id}.morse`;
  await RNFS.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf8');

  return fileData;
}

/**
 * 2. Đọc toàn bộ các file đề có trong thư mục
 */
export async function loadAllBoardFiles(): Promise<MorseBoardFile[]> {
  await ensureDirectoryExists();

  try {
    const files = await RNFS.readDir(BOARDS_DIR);
    const boardList: MorseBoardFile[] = [];

    for (const file of files) {
      if (
        file.isFile() &&
        (file.name.endsWith('.morse') || file.name.endsWith('.json'))
      ) {
        try {
          const content = await RNFS.readFile(file.path, 'utf8');
          const parsed: MorseBoardFile = JSON.parse(content);
          // Kiểm tra tính hợp lệ cơ bản
          if (parsed && Array.isArray(parsed.groups) && parsed.title) {
            boardList.push(parsed);
          }
        } catch {
          // Bỏ qua file hỏng cú pháp
        }
      }
    }

    // Sắp xếp đề mới nhất lên đầu
    return boardList.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Lỗi khi đọc danh sách file bảng điện:', error);
    return [];
  }
}

/**
 * 3. Xóa file đề
 */
export async function deleteBoardFile(id: string): Promise<void> {
  const filePathMorse = `${BOARDS_DIR}/board_${id}.morse`;
  const filePathJson = `${BOARDS_DIR}/board_${id}.json`;

  if (await RNFS.exists(filePathMorse)) {
    await RNFS.unlink(filePathMorse);
  } else if (await RNFS.exists(filePathJson)) {
    await RNFS.unlink(filePathJson);
  }
}

/**
 * 4. Chia sẻ file đề ra ngoài (Zalo, Drive, Gmail...)
 * Sao chép sang thư mục Cache để thỏa mãn FileProvider của Android
 */
export async function exportBoardFile(board: MorseBoardFile): Promise<void> {
  // Đặt tên file gợi nhớ (thay ký tự đặc biệt bằng dấu gạch dưới)
  const safeTitle = board.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
  // Dùng đuôi .json để các app như Zalo, Drive, Gmail nhận diện chuẩn MIME type
  const fileName = `${safeTitle || 'de_morse'}_${board.id}.json`;

  // 1. Đường dẫn file gốc và đường dẫn file tạm trong Cache
  const originalPath = `${BOARDS_DIR}/board_${board.id}.morse`;
  const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

  // 2. Đảm bảo dữ liệu được ghi vào file trong thư mục Cache
  const jsonContent = JSON.stringify(board, null, 2);
  await RNFS.writeFile(cachePath, jsonContent, 'utf8');

  // 3. Chia sẻ trực tiếp qua giao thức file:// từ Cache
  try {
    await Share.open({
      title: `Chia sẻ bảng điện: ${board.title}`,
      subject: `Bảng điện Morse: ${board.title}`,
      filename: fileName,
      url: `file://${cachePath}`,
      type: 'application/json',
      failOnCancel: false,
    });
  } finally {
    // 4. Dọn dẹp file tạm trong cache sau khi mở hộp thoại chia sẻ
    try {
      const exists = await RNFS.exists(cachePath);
      if (exists) {
        await RNFS.unlink(cachePath);
      }
    } catch {
      // Bỏ qua nếu chưa xóa được file cache ngay
    }
  }
}

/**
 * 5. Import file từ bên ngoài vào thư mục của app
 */
export async function importBoardFromFile(
  fileUri: string,
): Promise<MorseBoardFile> {
  await ensureDirectoryExists();

  // Đọc nội dung file từ URI
  const rawContent = await RNFS.readFile(fileUri, 'utf8');
  const parsed = JSON.parse(rawContent);

  // Validate cấu trúc
  if (!parsed || !Array.isArray(parsed.groups) || parsed.groups.length === 0) {
    throw new Error('File không hợp lệ hoặc không có danh sách nhóm mã Morse.');
  }

  const newId = Date.now().toString();
  const importedBoard: MorseBoardFile = {
    version: 1,
    id: newId,
    title: parsed.title ? `(Nhập) ${parsed.title}` : `Bảng điện nhập ${newId}`,
    createdAt: Date.now(),
    config: {
      groupCount: parsed.groups.length,
      characterType: parsed.config?.characterType ?? 'letter',
      useShortNumbers: parsed.config?.useShortNumbers ?? false,
      hasPreamble: parsed.config?.hasPreamble ?? false,
      nrValue: parsed.config?.nrValue ?? '01/HL',
      dateISO: parsed.config?.dateISO ?? new Date().toISOString(),
      timeISO: parsed.config?.timeISO ?? new Date().toISOString(),
    },
    groups: parsed.groups,
  };

  // Ghi vào thư mục cục bộ của ứng dụng
  const destPath = `${BOARDS_DIR}/board_${newId}.morse`;
  await RNFS.writeFile(
    destPath,
    JSON.stringify(importedBoard, null, 2),
    'utf8',
  );

  return importedBoard;
}
