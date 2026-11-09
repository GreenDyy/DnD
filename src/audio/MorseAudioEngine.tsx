import { AudioContext, OscillatorNode, GainNode } from 'react-native-audio-api';
import { textToMorse } from '../constants/morseMap';

// Định nghĩa kiểu dữ liệu callback thông báo tiến trình phát ký tự ra giao diện
export type MorseProgressCallback = (textIndex: number, char: string) => void;

type MorseToneEvent = {
  startMs: number;
  durationMs: number;
};

type MorseProgressEvent = {
  timeMs: number;
  textIndex: number;
  char: string;
};

const TONES_PER_AUDIO_BATCH = 20;
const AUDIO_BATCH_LOOKAHEAD_MS = 250;

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

  private manualToneGeneration = 0;

  private manualAudioReady: Promise<void> | null = null;

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

  private playbackTones: MorseToneEvent[] = [];

  private playbackProgress: MorseProgressEvent[] = [];

  private playbackDurationMs = 0;

  private playbackElapsedMs = 0;

  private playbackStartTime = 0;

  private playbackTimer: ReturnType<typeof setTimeout> | null = null;

  private playbackTimerResolver: (() => void) | null = null;

  private audioScheduleTimer: ReturnType<typeof setTimeout> | null = null;

  private scheduledToneIndex = 0;

  private progressTimers: ReturnType<typeof setTimeout>[] = [];

  private audioPlaybackActive = false;

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
    if (!this.gain || !this.context) return;

    this.playing = true;
    const startTime = this.context.currentTime;
    this.gain.gain.cancelScheduledValues(startTime);
    this.gain.gain.setValueAtTime(this.volume, startTime);
    this.gain.gain.setValueAtTime(0, startTime + durationSec);
    await this.sleep(durationSec * 1000);
    this.gain.gain.value = 0;
    this.playing = false;
  }

  private setGainImmediately(value: number) {
    if (!this.gain || !this.context) return;

    const now = this.context.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(value, now);
  }

  private clearProgressTimers() {
    this.progressTimers.forEach(timer => clearTimeout(timer));
    this.progressTimers = [];
  }

  private clearAudioScheduleTimer() {
    if (this.audioScheduleTimer) {
      clearTimeout(this.audioScheduleTimer);
      this.audioScheduleTimer = null;
    }
  }

  private buildPlaybackPlan(text: string) {
    const unitMs = this.getUnitDurationMs();
    const tones: MorseToneEvent[] = [];
    const progress: MorseProgressEvent[] = [];
    let timeMs = 0;

    for (let textIndex = 0; textIndex < text.length; textIndex++) {
      const char = text[textIndex];
      progress.push({ timeMs, textIndex, char });

      if (char === ' ') {
        timeMs += unitMs * 4;
        continue;
      }

      const mode = this.useShortNumbers ? 'shortNumber' : 'standard';
      const morsePattern = textToMorse(char, mode);
      for (let symbolIndex = 0; symbolIndex < morsePattern.length; symbolIndex++) {
        const symbol = morsePattern[symbolIndex];
        const durationMs = symbol === '.' ? unitMs : unitMs * 3;
        tones.push({ startMs: timeMs, durationMs });
        timeMs += durationMs;

        if (symbolIndex < morsePattern.length - 1) {
          timeMs += unitMs;
        }
      }

      if (textIndex < text.length - 1) {
        timeMs += unitMs * 3;
      }
    }

    this.playbackTones = tones;
    this.playbackProgress = progress;
    this.playbackDurationMs = timeMs;
  }

  private schedulePlaybackAudio(token: number) {
    if (!this.context || !this.gain) return;

    this.clearAudioScheduleTimer();
    const now = this.context.currentTime;
    const startTime =
      now + Math.min(0.5, 0.05 + this.playbackTones.length / 10000);
    this.playbackStartTime = startTime - this.playbackElapsedMs / 1000;
    this.scheduledToneIndex = this.playbackTones.findIndex(
      tone => tone.startMs + tone.durationMs > this.playbackElapsedMs,
    );
    if (this.scheduledToneIndex < 0) {
      this.scheduledToneIndex = this.playbackTones.length;
    }

    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(0, now);

    this.scheduleNextAudioBatch(token);
  }

  private scheduleNextAudioBatch(token: number) {
    if (
      !this.context ||
      !this.gain ||
      !this.audioPlaybackActive ||
      this.isPaused ||
      this.stopRequested ||
      this.playbackToken !== token
    ) {
      return;
    }

    const now = this.context.currentTime;
    const elapsedMs = this.getPlaybackElapsedMs();
    while (
      this.scheduledToneIndex < this.playbackTones.length &&
      this.playbackTones[this.scheduledToneIndex].startMs +
        this.playbackTones[this.scheduledToneIndex].durationMs <= elapsedMs
    ) {
      this.scheduledToneIndex += 1;
    }

    const batchEnd = Math.min(
      this.scheduledToneIndex + TONES_PER_AUDIO_BATCH,
      this.playbackTones.length,
    );

    for (; this.scheduledToneIndex < batchEnd; this.scheduledToneIndex += 1) {
      const tone = this.playbackTones[this.scheduledToneIndex];
      const toneEndMs = tone.startMs + tone.durationMs;
      const toneStartMs = Math.max(tone.startMs, elapsedMs);
      const startAt = Math.max(
        now + 0.01,
        this.playbackStartTime + toneStartMs / 1000,
      );
      const endAt = Math.max(
        startAt + 0.001,
        this.playbackStartTime + toneEndMs / 1000,
      );

      this.gain.gain.setValueAtTime(this.volume, startAt);
      this.gain.gain.setValueAtTime(0, endAt);
    }

    if (this.scheduledToneIndex < this.playbackTones.length) {
      const nextTone = this.playbackTones[this.scheduledToneIndex];
      const nextBatchTime =
        this.playbackStartTime + nextTone.startMs / 1000;
      const delayMs = Math.max(
        0,
        (nextBatchTime - this.context.currentTime) * 1000 -
          AUDIO_BATCH_LOOKAHEAD_MS,
      );
      this.clearAudioScheduleTimer();
      this.audioScheduleTimer = setTimeout(() => {
        this.audioScheduleTimer = null;
        this.scheduleNextAudioBatch(token);
      }, delayMs);
    }
  }

  private scheduleProgressCallbacks(token: number) {
    if (!this.context) return;

    this.clearProgressTimers();
    for (const event of this.playbackProgress) {
      if (event.timeMs < this.playbackElapsedMs) continue;

      const delay = Math.max(
        0,
        (this.playbackStartTime + event.timeMs / 1000 - this.context.currentTime) * 1000,
      );
      const timer = setTimeout(() => {
        if (
          this.playbackToken !== token ||
          this.stopRequested ||
          this.isPaused
        ) {
          return;
        }
        this.currentIndex = event.textIndex;
        this.onProgressCallback?.(event.textIndex, event.char);
      }, delay);
      this.progressTimers.push(timer);
    }
  }

  private getPlaybackElapsedMs() {
    if (!this.context || this.playbackStartTime <= 0) {
      return this.playbackElapsedMs;
    }
    return Math.max(
      this.playbackElapsedMs,
      Math.min(
        this.playbackDurationMs,
        (this.context.currentTime - this.playbackStartTime) * 1000,
      ),
    );
  }

  private async waitForPlayback(token: number) {
    while (
      this.audioPlaybackActive &&
      this.playbackToken === token &&
      !this.stopRequested
    ) {
      if (this.isPaused) {
        await new Promise<void>(resolve => {
          this.resumeResolver = resolve;
        });
        this.resumeResolver = null;
        continue;
      }

      const remainingMs = this.playbackDurationMs - this.playbackElapsedMs;
      if (remainingMs <= 0) break;

      await new Promise<void>(resolve => {
        this.playbackTimerResolver = resolve;
        const endTime =
          this.playbackStartTime + this.playbackDurationMs / 1000;
        this.playbackTimer = setTimeout(() => {
          this.playbackElapsedMs = this.playbackDurationMs;
          this.playbackTimer = null;
          this.playbackTimerResolver = null;
          resolve();
        }, Math.max(0, (endTime - this.context!.currentTime) * 1000));
      });

      if (!this.isPaused) {
        this.playbackElapsedMs = this.playbackDurationMs;
      }
    }
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
    this.playbackElapsedMs = 0;
    this.playbackStartTime = 0;
    this.audioPlaybackActive = true;
    this.buildPlaybackPlan(text);

    await this.start();
    if (this.playbackToken !== token || this.stopRequested) return;

    while (this.isPaused) {
      if (!this.audioPlaybackActive || this.playbackToken !== token) return;
      await this.waitUntilResumed();
    }
    if (!this.audioPlaybackActive || this.playbackToken !== token) return;

    this.schedulePlaybackAudio(token);
    this.scheduleProgressCallbacks(token);
    await this.waitForPlayback(token);

    // Hoàn thành bài phát: reset lại các trạng thái
    if (this.playbackToken === token && !this.stopRequested) {
      this.audioPlaybackActive = false;
      this.clearProgressTimers();
      this.playing = false;
      this.isPaused = false;
      this.currentIndex = 0;
      this.onProgressCallback?.(-1, ''); // Xóa highlight trên giao diện
    }
  }

  async playMorse(code: string) {
    const normalizedCode = code.trim();
    if (!/^[.-]+$/.test(normalizedCode)) {
      throw new Error('Morse code must contain dots and dashes only.');
    }

    if (this.isPaused && this.currentText === normalizedCode) {
      this.resume();
      return;
    }

    const token = ++this.playbackToken;
    this.stopRequested = false;
    this.isPaused = false;
    this.currentText = normalizedCode;
    this.currentIndex = 0;

    await this.start();
    await this.playSingleMorseChar(normalizedCode, token);

    if (this.playbackToken === token) {
      this.playing = false;
      this.isPaused = false;
      this.currentIndex = 0;
      this.onProgressCallback?.(-1, '');
    }
  }

  // Tạm dừng bài phát hiện tại, lưu lại vị trí ký tự đang phát dở
  pause() {
    if (this.audioPlaybackActive && !this.isPaused) {
      this.playbackElapsedMs = this.getPlaybackElapsedMs();
      this.clearProgressTimers();
      this.clearAudioScheduleTimer();
      if (this.playbackTimer) {
        clearTimeout(this.playbackTimer);
        this.playbackTimer = null;
      }
      this.setGainImmediately(0);
      this.playbackTimerResolver?.();
      this.playbackTimerResolver = null;
    }

    this.isPaused = true;
    this.stopRequested = false;
    this.playing = false;

    if (!this.audioPlaybackActive) this.setGainImmediately(0);
  }

  // Tiếp tục phát tiếp từ vị trí đã tạm dừng trước đó
  resume() {
    if (!this.currentText) return;
    this.isPaused = false;
    if (this.audioPlaybackActive && this.context && this.playbackStartTime > 0) {
      this.schedulePlaybackAudio(this.playbackToken);
      this.scheduleProgressCallbacks(this.playbackToken);
    }
    this.releasePause();
  }

  // Dừng hẳn bài phát hiện tại và hủy bỏ toàn bộ luồng đang chờ
  stop() {
    this.manualToneGeneration += 1;
    this.stopRequested = true;
    this.isPaused = false;
    this.playbackToken += 1;
    this.audioPlaybackActive = false;
    this.clearProgressTimers();
    this.clearAudioScheduleTimer();
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
    this.playbackTimerResolver?.();
    this.playbackTimerResolver = null;
    this.playing = false;
    this.currentIndex = 0;

    this.setGainImmediately(0);
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
    this.manualAudioReady = null;
    this.onProgressCallback = null;
  }

  private prepareManualAudio() {
    if (!this.manualAudioReady) {
      const audioReady = this.start();
      this.manualAudioReady = audioReady;
      void audioReady.catch(() => {
        if (this.manualAudioReady === audioReady) {
          this.manualAudioReady = null;
        }
      });
    }

    return this.manualAudioReady;
  }

  startManualTone() {
    const generation = ++this.manualToneGeneration;
    const audioReady = this.prepareManualAudio();

    void audioReady
      .then(() => {
        if (generation !== this.manualToneGeneration || !this.gain) return;

        this.setGainImmediately(this.volume);
        this.playing = true;
      })
      .catch(error => {
        if (__DEV__) {
          console.error('Failed to start manual Morse tone:', error);
        } else {
          console.error('Failed to start manual Morse tone.');
        }
      });
  }

  stopManualTone() {
    this.manualToneGeneration += 1;
    if (!this.gain) return;

    this.setGainImmediately(0);
    this.playing = false;
  }
}

// Xuất đối tượng dùng chung duy nhất (Singleton) cho toàn bộ ứng dụng
export const morseAudio = new MorseAudioEngine();