import { AudioContext, OscillatorNode, GainNode } from 'react-native-audio-api';

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

  // Tốc độ Morse: Characters Per Minute
  private cpm = 100;

  // Đánh dấu engine đã được khởi tạo hay chưa
  private initialized = false;

  // Đánh dấu hiện có đang phát tiếng beep hay không
  private playing = false;

  // Trạng thái tạm dừng / tiếp tục
  private isPaused = false;
  private stopRequested = false;
  private currentText = '';
  private currentMorse = '';
  private currentIndex = 0;
  private resumeResolver: (() => void) | null = null;
  private playbackToken = 0;

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
  setCpm(cpm: number) {
    // Chỉ cho phép CPM từ 5 đến 500
    this.cpm = Math.max(5, Math.min(500, cpm));
  }

  // Tính thời lượng của 1 đơn vị Morse, đơn vị là giây.
  // Chuẩn Morse: thời lượng 1 dot = 6 / CPM
  private getUnitDuration() {
    return 6 / this.cpm;
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

  private async waitUntilResumed() {
    if (!this.isPaused) {
      return;
    }

    await new Promise<void>(resolve => {
      this.resumeResolver = resolve;
    });

    this.resumeResolver = null;
  }

  // Phát một chuỗi Morse từ vị trí bắt đầu.
  // Ví dụ: "... --- ..." hoặc ".- / -..."
  private async playMorseFromIndex(morse: string, startIndex: number) {
    const token = ++this.playbackToken;
    this.stopRequested = false;
    this.currentMorse = morse;
    this.currentIndex = startIndex;

    await this.start();

    const unit = this.getUnitDuration();

    for (let i = startIndex; i < morse.length; i++) {
      if (this.playbackToken !== token) {
        return;
      }

      while (this.isPaused) {
        if (this.playbackToken !== token) {
          return;
        }
        await this.waitUntilResumed();
      }

      if (this.stopRequested || this.playbackToken !== token) {
        return;
      }

      const symbol = morse[i];

      if (symbol === '.') {
        await this.tone(unit);
        if (this.stopRequested || this.playbackToken !== token) {
          return;
        }
        await this.silence(1);
      }

      if (symbol === '-') {
        await this.tone(unit * 3);
        if (this.stopRequested || this.playbackToken !== token) {
          return;
        }
        await this.silence(1);
      }

      if (symbol === ' ') {
        await this.silence(2);
      }

      if (symbol === '/') {
        await this.silence(6);
      }

      this.currentIndex = i + 1;
    }

    this.playing = false;
    this.isPaused = false;
    this.currentIndex = morse.length;
  }

  async playMorse(morse: string) {
    await this.playMorseFromIndex(morse, 0);
  }

  // Chuyển text sang Morse rồi phát
  async playText(text: string) {
    this.currentText = text;
    const morse = textToMorse(text);
    await this.playMorseFromIndex(morse, 0);
  }

  pause() {
    this.isPaused = true;
    this.stopRequested = false;
    this.playing = false;

    if (this.gain) {
      this.gain.gain.value = 0;
    }
  }

  resume() {
    if (!this.currentMorse) {
      return;
    }

    this.isPaused = false;

    if (this.resumeResolver) {
      this.resumeResolver();
    }
  }

  restart() {
    this.stopRequested = false;
    this.isPaused = false;
    this.currentIndex = 0;
    this.playbackToken += 1;

    if (this.currentText) {
      this.playText(this.currentText);
    }
  }

  // Dừng tiếng beep hiện tại
  stop() {
    this.pause();
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
