export interface PreambleData {
  nr: string; // Ví dụ: "01/HL" hoặc "12"
  groupCount: number; // Lấy theo bảng
  date: Date; // Ngày chọn
  time: Date; // Giờ chọn
}

// Lấy ngày định dạng 4 chữ số (VD: 0909)
export function formatDatePart(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0'); // getMonth() chạy từ 0-11
  return `${dd}${mm}`;
}

// Lấy giờ phút định dạng 4 chữ số (VD: 1630)
export function formatTimePart(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}${mm}`;
}

// Chuỗi hiển thị trực quan cho người dùng đọc trên bảng
export function getDisplayPreamble(data: PreambleData): string {
  const nrPart = `NR ${data.nr.trim() || '01'}`;
  const grPart = `${data.groupCount}`;
  const datePart = formatDatePart(data.date);
  const timePart = formatTimePart(data.time);

  return `${nrPart} - ${grPart} - ${datePart} - ${timePart}`;
}

// Chuỗi phát âm thanh Morse thực tế (Lặp lại 2 lần mỗi phần tử)
export function getPlaybackPreamble(data: PreambleData): string {
  const cleanNr = `NR ${data.nr.trim() || '01'}`.toUpperCase();
  const cleanGr = `${data.groupCount}`;
  const cleanDate = formatDatePart(data.date);
  const cleanTime = formatTimePart(data.time);

  // Quy tắc: NR x2 -> GR x2 -> Date x2 -> Time x2
  return `${cleanNr} ${cleanNr} ${cleanGr} ${cleanGr} ${cleanDate} ${cleanDate} ${cleanTime} ${cleanTime}`;
}
