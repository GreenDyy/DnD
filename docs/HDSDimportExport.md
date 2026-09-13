# HƯỚNG DẪN SỬ DỤNG TÍNH NĂNG LƯU, XUẤT & NHẬP BẢNG ĐIỆN (.MORSE)

Tài liệu hướng dẫn chi tiết cách lưu đề luyện tập thành file độc lập, chia sẻ bộ đề qua các nền tảng (Zalo, Drive, Gmail...) và nhập file đề từ bên ngoài vào ứng dụng phục vụ huấn luyện báo vụ Morse.

---

## 1. Lưu Bảng Điện Vừa Phát Thành File

Khi bạn vừa cấu hình hoặc tạo ngẫu nhiên một bảng điện ưng ý trên màn hình **Bảng điện luyện tập**:

1. Nhìn lên thanh tiêu đề góc trên bên phải, nhấn vào **biểu tượng Dấu trang (Bookmark)**.
2. Một hộp thoại sẽ xuất hiện yêu cầu đặt tên cho đề (ví dụ: *Đề thi thử 20 nhóm chữ cái*).
3. Nhấn **Lưu file**. 
4. Hệ thống sẽ tự động đóng gói toàn bộ:
   - Các nhóm mã Morse (thân bức điện).
   - Cấu hình đầu điện nghiệp vụ (NR, Số nhóm, Ngày, Giờ).
   - Tùy chọn Số tắt / Số thường.
   - Định dạng lưu trữ: File độc lập `.morse` nằm trong bộ nhớ an toàn của thiết bị.

---

## 2. Quản Lý & Luyện Tập Lại Đề Đã Lưu

1. Từ màn hình chính, nhấn vào nút **Kho bảng điện đã lưu**.
2. Danh sách toàn bộ các file đề bạn từng lưu sẽ hiển thị từ mới nhất đến cũ nhất.
3. Mỗi thẻ đề hiển thị trực quan:
   - Tên đề, ngày lưu.
   - Thống kê: Số lượng nhóm, loại ký tự (Chữ/Số/Hỗn hợp), có đầu điện hay không.
   - Vài nhóm ký tự đầu để nhận diện nhanh.
4. Nhấn nút **Luyện lại**: Màn hình phát điện sẽ mở ra với đúng chính xác 100% nội dung và thông số của đề đó để bạn bấm phát Morse hoặc đọc đối chiếu.

---

## 3. Xuất & Chia Sẻ File Đề Cho Người Khác (Export)

Dùng khi Huấn luyện viên/Giáo viên muốn gửi đề thi thử cho học viên:

1. Vào **Kho bảng điện đã lưu**.
2. Tìm đến đề cần gửi, nhấn vào **biểu tượng Chia sẻ (Share)** ở góc trên bên phải của thẻ đề.
3. Menu chia sẻ của hệ điều hành sẽ xuất hiện:
   - Chọn gửi qua **Zalo, Telegram, Tin nhắn**.
   - Hoặc chọn tải lên **Google Drive, One Drive**.
   - Hoặc gửi qua **Gmail**.
4. Người nhận sẽ nhận được một file có định dạng `*.morse` (hoặc `*.json`).

---

## 4. Nhập File Đề Từ Bên Ngoài Vào Ứng Dụng (Import)

Dùng khi Học viên nhận được file đề từ giáo viên hoặc bạn bè:

1. Tải file `.morse` do người khác gửi về điện thoại (file thường nằm trong thư mục **Download / Tải về** hoặc thư mục Zalo).
2. Mở ứng dụng, vào màn hình **Kho bảng điện đã lưu**.
3. Nhấn nút **Nhập file (+)** ở góc trên cùng bên phải thanh tiêu đề.
4. Trình quản lý tệp của điện thoại mở ra:
   - Điều hướng đến thư mục vừa tải file về (thư mục *Download*).
   - Chọn file `.morse` (hoặc `.json`).
5. Ứng dụng sẽ tự động kiểm tra cấu trúc file:
   - Nếu hợp lệ: Xuất hiện thông báo nạp thành công và đề mới sẽ xuất hiện ngay ở đầu danh sách.
   - Nhấn **Luyện lại** để bắt đầu thu điện hoặc đối chiếu ngay.

---

## 5. Quy Chuẩn Tự Soạn File Đề Bằng Máy Tính (Cho Giáo Viên)

Giáo viên có thể dùng bất kỳ trình soạn thảo văn bản nào trên máy tính (Notepad, VS Code...) để tạo sẵn đề thi, lưu thành file với đuôi `.morse` hoặc `.json` theo cấu trúc sau:

```json
{
  "version": 1,
  "title": "Đề Kiểm Tra Thu Báo Đợt 1",
  "config": {
    "groupCount": 10,
    "characterType": "letter",
    "useShortNumbers": false,
    "hasPreamble": true,
    "nrValue": "02/TS",
    "dateISO": "2026-09-11T10:30:00.000Z",
    "timeISO": "2026-09-11T10:30:00.000Z"
  },
  "groups": [
    "ASDFG",
    "QWERT",
    "ZXCVB",
    "YUIOP",
    "HJKLM",
    "POIUY",
    "TREWQ",
    "MNBVC",
    "LKJHG",
    "FDSAR"
  ]
}