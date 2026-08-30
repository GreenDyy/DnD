export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.example.com';

export const APP_NAME = 'DnD';

export const AI_NAME = "Trợ lý Mori";

// Responses for out-of-scope questions
export const REPLIES = {
  OUT_OF_SCOPE: 'Xin lỗi, mình chỉ hỗ trợ về mã Morse và kỹ thuật báo vụ. Bạn có muốn hỏi gì về Morse không?',
  MODEL_LOADING: 'Đang tải model, vui lòng chờ...',
  MODEL_ERROR: 'Không thể tải model. Vui lòng thử lại.',
  GENERATE_ERROR: 'Xin lỗi, mình không thể trả lời lúc này.',
  TOKEN_LIMIT: 'Câu hỏi quá dài. Vui lòng rút gọn.',
};
