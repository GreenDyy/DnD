import { AudioContext, OscillatorNode, GainNode } from 'react-native-audio-api';
import { textToMorse } from '../constants/morseMap';

// Định nghĩa kiểu dữ liệu callback thông báo tiến trình phát ký tự ra giao diện
export type MorseProgressCallback = (textIndex: number, char: string) => void;

// Lớp điều khiển phát tín hiệu âm thanh Morse chuyên dụng
class MorseAudioEngine {
  // Đối tượng quản lý ngữ cảnh âm thanh của hệ thống (AudioContext)
  private context: AudioContext | null = null;

  // Node tạo sóng âm dạng hình sin để phát tiếng bip (Oscillator)
  private oscillator: OscillatorNode | null = null;

  // Node điều chỉnh âm lượng (GainNode): bật tiếng hoặc ngắt tiếng
  private gain: GainNode | null = null;

  // Tần số âm thanh tiếng bip (mặc định 600 Hz)
  private frequency = 600;

  // Biên độ âm lượng từ 0.0 đến 1.0 (mặc định 0.5)
  private volume = 0.5;

  // Tốc độ phát mã Morse tính theo ký tự/phút (CPM - Characters Per Minute)
  private cpm = 100;

  // Cờ đánh dấu engine âm thanh đã khởi tạo thành công hay chưa
  private initialized = false;

  // Cờ trạng thái âm thanh tiếng bip đang kêu (true) hay tắt (false)
  private playing = false;

  // Cờ bật/tắt chế độ mã hóa số tắt (Short Numbers: 1=.-, 0=-, ...)
  private useShortNumbers = false;

  // Cờ đánh dấu luồng phát đang ở trạng thái tạm dừng (Pause)
  private isPaused = false;

  // Cờ ngắt luồng cưỡng bức khi người dùng bấm Stop/Reset
  private stopRequested = false;

  // Lưu trữ chuỗi văn bản đang phát để hỗ trợ resume tiếp tục
  private currentText = '';

  // Chỉ số ký tự đang phát dở trong chuỗi văn bản
  private currentIndex = 0;

  // Hàm kích hoạt tiếp tục luồng Promise khi nhấn Resume
  private resumeResolver: (() => void) | null = null;

  // Token phiên phát để vô hiệu hóa các luồng phát cũ khi bấm phát mới liên tục
  private playbackToken = 0;

  // Hàm callback gửi chỉ số ký tự và mặt chữ đang phát ra ngoài UI để highlight
  private onProgressCallback: MorseProgressCallback | null = null;

  // Đăng ký hàm nhận tiến trình phát ký tự từ bên ngoài UI
  setOnProgress(callback: MorseProgressCallback | null) {
    this.onProgressCallback = callback;
  }

  // Bật hoặc tắt chế độ phát số tắt (Short Numbers)
  setUseShortNumbers(enabled: boolean) {
    this.useShortNumbers = enabled;
  }

  // Lấy trạng thái hiện tại của chế độ số tắt
  getUseShortNumbers() {
    return this.useShortNumbers;
  }

  // Kiểm tra xem luồng phát có đang bị tạm dừng hay không
  getIsPaused() {
    return this.isPaused;
  }

  // Kiểm tra xem hiện có đang phát tiếng bip hay không
  getIsPlaying() {
    return this.playing;
  }

  // Khởi tạo AudioContext, Oscillator và GainNode nếu chưa tạo
  private ensureInitialized() {
    if (this.initialized) return;

    this.context = new AudioContext();
    this.oscillator = this.context.createOscillator();
    this.gain = this.context.createGain();

    // Dùng sóng sin để âm thanh phát ra êm tai, không bị chát
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = this.frequency;
    this.gain.gain.value = 0; // Khởi đầu ngắt âm

    // Kết nối mạch âm thanh: Nguồn phát -> Điều khiển âm lượng -> Loa thiết bị
    this.oscillator.connect(this.gain);
    this.gain.connect(this.context.destination);
    this.oscillator.start();

    this.initialized = true;
  }

  // Đảm bảo phần cứng âm thanh sẵn sàng hoạt động (đánh thức nếu bị sleep)
  async start() {
    this.ensureInitialized();
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
  }

  // Đặt lại tần số âm thanh (Pitch) theo Hz
  setFrequency(frequency: number) {
    this.frequency = frequency;
    if (this.oscillator) {
      this.oscillator.frequency.value = frequency;
    }
  }

  // Đặt lại âm lượng phát (giới hạn an toàn từ 0 đến 1)
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gain && !this.playing) {
      this.gain.gain.value = 0;
    }
  }

  // Cài đặt tốc độ phát theo chuẩn CPM (chữ/phút)
  setCpm(cpm: number) {
    this.cpm = Math.max(5, Math.min(500, cpm));
  }

  // Tính thời lượng chuẩn của 1 đơn vị dot (ms) theo tiêu chuẩn quốc tế PARIS
  private getUnitDurationMs(): number {
    return 6000 / this.cpm;
  }

  // Bật tiếng bip trong khoảng thời gian durationSec (giây) rồi ngắt
  private async tone(durationSec: number) {
    if (!this.gain) return;

    this.playing = true;
    this.gain.gain.value = this.volume;
    await this.sleep(durationSec * 1000);
    this.gain.gain.value = 0;
    this.playing = false;
  }

  // Tạo khoảng lặng ngắt tiếng kéo dài theo số đơn vị nhịp (units)
  private async silence(units: number) {
    await this.sleep(this.getUnitDurationMs() * units);
  }

  // Hàm trì hoãn bất đồng bộ theo mili-giây
  private sleep(ms: number) {
    return new Promise<void>(resolve => {
      setTimeout(resolve, ms);
    });
  }

  // Treo luồng chờ đợi đến khi hàm resume() được gọi
  private async waitUntilResumed() {
    if (!this.isPaused) return;

    await new Promise<void>(resolve => {
      this.resumeResolver = resolve;
    });
    this.resumeResolver = null;
  }

  // Giải phóng cờ chờ để tiếp tục chạy tiếp luồng phát
  private releasePause() {
    if (this.resumeResolver) {
      this.resumeResolver();
      this.resumeResolver = null;
    }
  }

  // Phát một mẫu mã Morse của 1 ký tự cụ thể (Ví dụ: ".-" của chữ A)
  private async playSingleMorseChar(morseChar: string, token: number) {
    const unitMs = this.getUnitDurationMs();

    for (let i = 0; i < morseChar.length; i++) {
      // Dừng ngay nếu phiên phát đã bị hủy hoặc bấm Stop
      if (this.playbackToken !== token || this.stopRequested) return;

      // Nếu đang Pause thì dừng chờ tại đây
      while (this.isPaused) {
        if (this.playbackToken !== token || this.stopRequested) return;
        await this.waitUntilResumed();
      }

      const symbol = morseChar[i];
      if (symbol === '.') {
        await this.tone(unitMs / 1000); // Dot dài 1 đơn vị
      } else if (symbol === '-') {
        await this.tone((unitMs * 3) / 1000); // Dash dài 3 đơn vị
      }

      // Khoảng lặng giữa các dot/dash trong cùng một chữ cái dài đúng 1 đơn vị
      // Không ngắt nghỉ ở dot/dash cuối cùng của ký tự
      if (i < morseChar.length - 1) {
        await this.silence(1);
      }
    }
  }

  // Phát toàn bộ chuỗi văn bản text với nhịp phách chuẩn và gửi callback tiến trình
  async playText(text: string) {
    // Nếu đang tạm dừng đúng chuỗi văn bản này thì chỉ cần Resume lại
    if (this.isPaused && this.currentText === text) {
      this.resume();
      return;
    }

    const token = ++this.playbackToken;
    this.stopRequested = false;
    this.isPaused = false;

    this.currentText = text;
    this.currentIndex = 0;

    await this.start();

    for (let i = 0; i < text.length; i++) {
      if (this.playbackToken !== token || this.stopRequested) return;

      this.currentIndex = i;

      // Treo luồng nếu người dùng bấm Pause giữa chừng
      while (this.isPaused) {
        if (this.playbackToken !== token || this.stopRequested) return;
        await this.waitUntilResumed();
      }

      const char = text[i];
      // Bắn vị trí ký tự ra giao diện để highlight màu
      this.onProgressCallback?.(i, char);

      // Xử lý khoảng cách giữa các nhóm (Dấu cách: tổng nghỉ chuẩn là 7 đơn vị)
      if (char === ' ') {
        // Đã có 3 đơn vị nghỉ từ chữ cái trước đó, chỉ cần nghỉ thêm 4 đơn vị là tròn 7
        await this.silence(4);
        continue;
      }

      // Chuyển ký tự sang chuỗi mã Morse theo bảng quy ước
      const mode = this.useShortNumbers ? 'shortNumber' : 'standard';
      const morsePattern = textToMorse(char, mode);

      if (morsePattern) {
        await this.playSingleMorseChar(morsePattern, token);

        // Khoảng nghỉ giữa các ký tự trong cùng một nhóm là đúng 3 đơn vị
        const nextChar = i < text.length - 1 ? text[i + 1] : null;
        if (nextChar) {
          await this.silence(3);
        }
      }
    }

    // Hoàn thành bài phát: reset lại các trạng thái
    if (this.playbackToken === token) {
      this.playing = false;
      this.isPaused = false;
      this.currentIndex = 0;
      this.onProgressCallback?.(-1, ''); // Xóa highlight trên giao diện
    }
  }

  // Tạm dừng bài phát hiện tại, lưu lại vị trí ký tự đang phát dở
  pause() {
    this.isPaused = true;
    this.stopRequested = false;
    this.playing = false;

    // Ngắt tiếng ngay lập tức
    if (this.gain) {
      this.gain.gain.value = 0;
    }
  }

  // Tiếp tục phát tiếp từ vị trí đã tạm dừng trước đó
  resume() {
    if (!this.currentText) return;
    this.isPaused = false;
    this.releasePause();
  }

  // Dừng hẳn bài phát hiện tại và hủy bỏ toàn bộ luồng đang chờ
  stop() {
    this.stopRequested = true;
    this.isPaused = false;
    this.playbackToken += 1;
    this.playing = false;
    this.currentIndex = 0;

    if (this.gain) {
      this.gain.gain.value = 0;
    }
    this.releasePause();
    this.onProgressCallback?.(-1, '');
  }

  // Giải phóng hoàn toàn phần cứng âm thanh native khi màn hình bị unmount
  async dispose() {
    this.stop();

    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }

    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    this.gain = null;
    this.initialized = false;
    this.onProgressCallback = null;
  }
}

// Xuất đối tượng dùng chung duy nhất (Singleton) cho toàn bộ ứng dụng
export const morseAudio = new MorseAudioEngine();