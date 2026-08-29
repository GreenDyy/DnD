export default {
  "topic": "morse_rules",
  "rules": [
    {
      "title": "Tích (dot)",
      "content": "Tín hiệu Morse ngắn, ký hiệu bằng dấu chấm '.'. Tích là đơn vị cơ bản nhất của Morse.",
      "keywords": ["tích", "dot", "ngắn", "chấm"]
    },
    {
      "title": "Tà (dash)",
      "content": "Tín hiệu Morse dài, ký hiệu bằng dấu gạch ngang '-'. Một tà bằng 3 tích.",
      "keywords": ["tà", "dash", "dài", "gạch"]
    },
    {
      "title": "Khoảng cách giữa các thành phần",
      "content": "Các tích và tà trong cùng một ký tự được phát liên tiếp với khoảng cách ngắn bằng 1 tích.",
      "keywords": ["khoảng cách", "nội bộ", "thành phần"]
    },
    {
      "title": "Khoảng cách giữa ký tự",
      "content": "Giữa hai ký tự có khoảng nghỉ dài bằng 3 tích (bằng 1 tà). Đây là quy tắc quan trọng để phân biệt ký tự.",
      "keywords": ["khoảng cách", "ký tự", "phân biệt"]
    },
    {
      "title": "Khoảng cách giữa các từ",
      "content": "Giữa hai từ có khoảng nghỉ dài bằng 7 tích (hơn 2 tà). Khoảng cách này giúp phân biệt từ trong câu.",
      "keywords": ["từ", "khoảng nghỉ", "câu"]
    },
    {
      "title": "SOS",
      "content": "SOS là tín hiệu khẩn cấp quốc tế: ...---... (3 tích - 3 tà - 3 tích). Đây là tổ hợp Morse dễ nhận biết nhất.",
      "keywords": ["SOS", "khẩn cấp", "cấp cứu", "emergency"]
    },
    {
      "title": "Tần số phát",
      "content": "Tín hiệu Morse thường phát ở tần số 600-1000Hz. Tần số phổ biến nhất là 800Hz. Tần số thấp quá sẽ khó nghe, cao quá sẽ gây mệt mỏi.",
      "keywords": ["tần số", "frequency", "Hz", "âm thanh", "tai nghe"]
    },
    {
      "title": "Tốc độ phát (WPM)",
      "content": "WPM (Words Per Minute) là số từ phát mỗi phút. Đơn vị QSD: 1 tích = 1 QSD. Tốc độ chuẩn: 15-20 WPM cho giao tiếp thông thường, 25-30 WPM cho mục đích chuyên nghiệp.",
      "keywords": ["tốc độ", "WPM", "words per minute", "QSD", "chuyên nghiệp"]
    },
    {
      "title": "Prosigns - Ký hiệu đặc biệt",
      "content": "Prosigns là các tổ hợp Morse đặc biệt dùng trong giao tiếp: AS (chờ), K (phản hồi/đã nhận), SK (kết thúc cuộc gọi), KN (chỉ người cụ thể), BT (dấu câu).",
      "keywords": ["prosign", "ký hiệu đặc biệt", "AS", "K", "SK", "KN", "BT"]
    },
    {
      "title": "Quy tắc truyền",
      "content": "Trước khi gửi tin, phải kiểm tra tần số trống. Khi gửi, phát liên tục không dừng giữa chừng. Sau khi gửi xong, phát SK để báo hiệu kết thúc.",
      "keywords": ["quy tắc", "truyền", "gửi tin", "kết thúc"]
    },
    {
      "title": "Lỗi thường gặp",
      "content": "Sai khoảng cách: nhầm lẫn giữa 'tích nội bộ' và 'khoảng cách ký tự'. Sai tần số: phát quá nhanh hoặc quá chậm. Nhầm lẫn ký tự: O (---) và S (...) khi prejudgement.",
      "keywords": ["lỗi", "sai", "nhầm", "khoảng cách"]
    },
    {
      "title": "Best practices",
      "content": "Luôn giữ tốc độ ổn định. Phát rõ ràng từng tích/tà. Dùng tần số 800Hz để dễ nghe. Thực hành hàng ngày 15-30 phút để cải thiện tốc độ.",
      "keywords": ["best practices", "thực hành", "cải thiện", "tốc độ"]
    },
    {
      "title": "Ứng dụng thực tế",
      "content": "Morse được sử dụng trong: hàng hải (SOLAS), hàng không, quân sự, amateur radio (ham radio), cứu hộ. Hiện nay vẫn còn hoạt động trên HF radio.",
      "keywords": ["ứng dụng", "hàng hải", "quân sự", "amateur radio", "ham radio", "cứu hộ"]
    }
  ]
};
