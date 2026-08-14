import {
  AudioContext,
  OscillatorNode,
  GainNode,
} from 'react-native-audio-api';

// Hàm chuyển văn bản bình thường thành chuỗi Morse.
// Ví dụ: "SOS" → "... --- ..."
import { textToMorse } from '../constants/morseMap';

// Class chịu trách nhiệm tạo và điều khiển âm thanh Morse
class MorseAudioEngine {
  // AudioContext: môi trường/engine quản lý âm thanh
  private context: AudioContext | null = null;

  // OscillatorNode: node tạo sóng âm thanh, ở đây dùng để tạo tiếng beep
  private oscillator: OscillatorNode | null = null;

  // GainNode: node điều khiển âm lượng.
  // Ta bật/tắt tiếng beep bằng cách thay đổi gain giữa volume và 0
  private gain: GainNode | null = null;

  // Tần số tiếng beep, đơn vị Hz
  private frequency = 600;

  // Âm lượng từ 0 đến 1
  private volume = 0.5;

  // Tốc độ Morse: Words Per Minute
  private wpm = 20;

  // Đánh dấu engine đã được khởi tạo hay chưa
  private initialized = false;

  // Đánh dấu hiện có đang phát tiếng beep hay không
  private playing = false;

  // Khởi tạo audio engine nếu chưa khởi tạo
  private ensureInitialized() {
    // Nếu đã tạo context, oscillator và gain rồi thì không tạo lại
    if (this.initialized) {
      return;
    }

    // Tạo audio context
    this.context = new AudioContext();

    // Tạo bộ phát sóng âm và node điều chỉnh âm lượng
    this.oscillator = this.context.createOscillator();
    this.gain = this.context.createGain();

    // Chọn dạng sóng sine để tiếng beep êm hơn
    this.oscillator.type = 'sine';

    // Đặt tần số ban đầu cho oscillator
    this.oscillator.frequency.value = this.frequency;

    // Ban đầu để âm lượng bằng 0 để chưa phát ra tiếng
    this.gain.gain.value = 0;

    // Nối luồng âm thanh:
    // oscillator tạo âm → gain điều chỉnh volume → loa/tai nghe
    this.oscillator.connect(this.gain);
    this.gain.connect(this.context.destination);

    // Bắt đầu oscillator ngay từ đầu.
    // Âm có phát ra hay không phụ thuộc vào gain.gain.value.
    this.oscillator.start();

    // Đánh dấu đã khởi tạo thành công
    this.initialized = true;
  }

  // Bảo đảm audio context đã sẵn sàng để phát âm
  async start() {
    // Khởi tạo nếu cần
    this.ensureInitialized();

    // Nếu context đang bị tạm dừng thì tiếp tục nó
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
  }

  // Cập nhật tần số tiếng beep
  setFrequency(frequency: number) {
    // Lưu giá trị để dùng cho các lần khởi tạo sau
    this.frequency = frequency;

    // Nếu oscillator đang tồn tại thì cập nhật ngay lập tức
    if (this.oscillator) {
      this.oscillator.frequency.value = frequency;
    }
  }

  // Cập nhật âm lượng
  setVolume(volume: number) {
    // Giới hạn âm lượng luôn nằm trong khoảng 0 đến 1
    this.volume = Math.max(0, Math.min(1, volume));

    // Nếu hiện không phát Morse thì giữ gain bằng 0 để không có tiếng
    if (this.gain && !this.playing) {
      this.gain.gain.value = 0;
    }
  }

  // Cập nhật tốc độ Morse
  setWpm(wpm: number) {
    // Chỉ cho phép WPM từ 5 đến 100
    this.wpm = Math.max(5, Math.min(100, wpm));
  }

  // Tính thời lượng của 1 đơn vị Morse, đơn vị là giây.
  // Chuẩn Morse: thời lượng 1 dot = 1.2 / WPM
  private getUnitDuration() {
    return 1.2 / this.wpm;
  }

  // Phát một tiếng beep trong khoảng duration giây
  private async tone(duration: number) {
    // Không có gain node thì không thể điều chỉnh/phát âm
    if (!this.gain) {
      return;
    }

    // Đánh dấu đang phát
    this.playing = true;

    // Bật âm lượng lên mức đã chọn
    this.gain.gain.value = this.volume;

    // Chờ đủ thời lượng của dot hoặc dash
    await this.sleep(duration * 1000);

    // Tắt âm lượng để kết thúc tiếng beep
    this.gain.gain.value = 0;

    // Đánh dấu đã ngừng phát tone
    this.playing = false;
  }

  // Im lặng trong một số đơn vị Morse
  private async silence(units: number) {
    // units = số đơn vị thời gian cần chờ
    await this.sleep(this.getUnitDuration() * units * 1000);
  }

  // Hàm hỗ trợ chờ bất đồng bộ theo milliseconds
  private sleep(ms: number) {
    return new Promise<void>(resolve => {
      setTimeout(resolve, ms);
    });
  }

  // Phát một chuỗi Morse.
  // Ví dụ: "... --- ..." hoặc ".- / -..."
  async playMorse(morse: string) {
    // Khởi động audio context trước khi phát
    await this.start();

    // Lấy thời lượng một đơn vị Morse hiện tại
    const unit = this.getUnitDuration();

    // Duyệt qua từng ký hiệu trong chuỗi Morse
    for (let i = 0; i < morse.length; i++) {
      const symbol = morse[i];

      // Dấu chấm: phát 1 đơn vị thời gian
      if (symbol === '.') {
        await this.tone(unit);

        // Khoảng cách giữa các dấu trong cùng một ký tự: 1 unit
        await this.silence(1);
      }

      // Dấu gạch: phát 3 đơn vị thời gian
      if (symbol === '-') {
        await this.tone(unit * 3);

        // Khoảng cách giữa các dấu trong cùng một ký tự: 1 unit
        await this.silence(1);
      }

      // Dấu cách: kết thúc một chữ cái.
      // Vì trước đó dot/dash đã có silence 1 unit,
      // nên thêm 2 units để tổng khoảng cách giữa chữ cái là 3 units.
      if (symbol === ' ') {
        await this.silence(2);
      }

      // Dấu /: phân cách các từ.
      // Vì trước đó dot/dash đã có silence 1 unit,
      // nên thêm 6 units để tổng khoảng cách giữa từ là 7 units.
      if (symbol === '/') {
        await this.silence(6);
      }
    }

    // Đảm bảo trạng thái cuối cùng là không còn phát
    this.playing = false;
  }

  // Chuyển text sang Morse rồi phát
  async playText(text: string) {
    // Ví dụ "SOS" → "... --- ..."
    const morse = textToMorse(text);

    // Phát chuỗi Morse vừa tạo
    await this.playMorse(morse);
  }

  // Dừng tiếng beep hiện tại
  stop() {
    // Đánh dấu không còn phát
    this.playing = false;

    // Tắt volume ngay lập tức
    if (this.gain) {
      this.gain.gain.value = 0;
    }
  }

  // Giải phóng audio resources khi không còn dùng engine
  async dispose() {
    // Dừng âm thanh trước
    this.stop();

    // Dừng oscillator.
    // Một oscillator đã stop thì không nên start lại.
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }

    // Đóng audio context và giải phóng tài nguyên native
    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    // Xóa tham chiếu gain node
    this.gain = null;

    // Cho phép khởi tạo lại engine ở lần dùng tiếp theo
    this.initialized = false;
  }
}

// Tạo một instance dùng chung cho toàn ứng dụng
export const morseAudio = new MorseAudioEngine();