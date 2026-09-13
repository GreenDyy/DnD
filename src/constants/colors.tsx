export const Colors = {
  // 1. Màu thương hiệu / Chủ đạo (Primary Emerald)
  primary: {
    50: '#ECFDF5',   // Nền siêu nhạt, tint badge
    100: '#D1FAE5',  // Highlight cực nhẹ
    200: '#A7F3D0',  // Viền chip active
    300: '#6EE7B7',  // Trạng thái hover/active nhẹ
    400: '#34D399',  // Switch active tint
    500: '#10B981',  // Xanh lá chuẩn hiện đại
    600: '#059669',  // Màu chủ đạo chính (Nút bấm, Header, Accent)
    700: '#047857',  // Primary nhấn mạnh, active press
    800: '#065F46',  // Text xanh đậm
    900: '#064E3B',  // Text tiêu đề xanh thẫm
  },

  // 2. Màu nhấn / Quân sự - Kỹ thuật (Military Accent)
  accent: {
    amber: '#F59E0B',    // Đang tạm dừng phát (Pause)
    amberDark: '#D97706',
    yellowLight: '#FEF3C7',
    red: '#EF4444',      // Nút Xóa, lỗi
    redLight: '#FEE2E2',
    blue: '#0284C7',     // Thông tin phụ trợ
  },

  // 3. Hệ màu xám & nền (Slate Neutrals)
  neutral: {
    white: '#FFFFFF',
    background: '#F8FAFC',  // Nền toàn app
    card: '#FFFFFF',        // Nền thẻ card
    surfaceSubtle: '#F1F5F9', // Nền chip không chọn, nút icon phụ
    border: '#E2E8F0',      // Viền card, viền input
    borderStrong: '#CBD5E1',// Viền khi focus/hover nhẹ
    textPrimary: '#0F172A', // Văn bản chính, tiêu đề
    textSecondary: '#475569',// Nhãn trường, mô tả ngắn
    textMuted: '#94A3B8',   // Placeholder, ngày tháng
    divider: '#F1F5F9',
  },

  // 4. Các màu trạng thái của Bảng điện Morse
  morse: {
    charDefault: '#0F172A',
    charHighlightedText: '#FFFFFF',
    charHighlightedBg: '#059669', // Highlight ký tự đang kêu beep
    compareHighlightBg: '#10B981', // Highlight khi đang đối chiếu
    markerText: '#047857',
    markerBg: '#ECFDF5',
  },
} as const;

// Preset màu dùng nhanh trong style sheet
export const Theme = {
  primary: Colors.primary[600],
  primaryLight: Colors.primary[50],
  primaryBorder: Colors.primary[200],
  background: Colors.neutral.background,
  card: Colors.neutral.card,
  text: Colors.neutral.textPrimary,
  textSecondary: Colors.neutral.textSecondary,
  border: Colors.neutral.border,
  error: Colors.accent.red,
  warning: Colors.accent.amber,
};