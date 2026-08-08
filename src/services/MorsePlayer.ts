import Sound from 'react-native-sound';
import { MORSE_MAP } from '../constants/morseMap';

Sound.setCategory('Playback');

class MorsePlayer {
  private dotSound: Sound;
  private dashSound: Sound;

  private stopped = false;

  /**
   * 20 WPM mặc định
   */
  private wpm = 20;

  constructor() {
    this.dotSound = new Sound(
      'dot.wav',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.log('dot load error', error);
        }
      },
    );

    this.dashSound = new Sound(
      'dash.wav',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.log('dash load error', error);
        }
      },
    );
  }

  /**
   * tốc độ học Morse
   * 5 ~ rất chậm
   * 10 ~ chậm
   * 20 ~ bình thường
   * 30+ ~ nhanh
   */
  setWpm(wpm: number) {
    this.wpm = Math.max(5, wpm);
  }

  /**
   * 1 unit theo chuẩn Morse
   */
  private getUnitMs() {
    return 1200 / this.wpm;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  private playSound(sound: Sound): Promise<void> {
    return new Promise(resolve => {
      sound.stop(() => {
        sound.play(() => {
          resolve();
        });
      });
    });
  }

  private async playSymbol(symbol: string) {
    if (this.stopped) {
      return;
    }

    if (symbol === '.') {
      await this.playSound(this.dotSound);
    } else {
      await this.playSound(this.dashSound);
    }

    // gap giữa symbol
    await this.sleep(this.getUnitMs());
  }

  async playLetter(letter: string) {
    const morse = MORSE_MAP[letter.toUpperCase()];

    if (!morse) {
      return;
    }

    for (const symbol of morse) {
      if (this.stopped) {
        return;
      }

      await this.playSymbol(symbol);
    }

    // gap giữa chữ
    await this.sleep(this.getUnitMs() * 3);
  }

  async playText(text: string) {
    this.stopped = false;

    const chars = text.toUpperCase();

    for (const char of chars) {
      if (this.stopped) {
        return;
      }

      if (char === ' ') {
        await this.sleep(this.getUnitMs() * 7);
        continue;
      }

      await this.playLetter(char);
    }
  }

  stop() {
    this.stopped = true;

    this.dotSound.stop();
    this.dashSound.stop();
  }

  release() {
    this.dotSound.release();
    this.dashSound.release();
  }
}

export default new MorsePlayer();