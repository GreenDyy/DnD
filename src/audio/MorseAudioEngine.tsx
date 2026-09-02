import MorsePlayer from '../services/MorsePlayer';

class MorseAudioEngine {
  private frequency = 600;
  private volume = 0.5;
  private wpm = 20;
  private currentText = '';

  setFrequency(frequency: number) {
    this.frequency = frequency;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setWpm(wpm: number) {
    this.wpm = Math.max(5, Math.min(100, wpm));
  }

  async playText(text: string) {
    if (!text) {
      return;
    }

    this.currentText = text;
    MorsePlayer.setWpm(this.wpm);
    await MorsePlayer.playText(text);
  }

  pause() {
    MorsePlayer.stop();
  }

  resume() {
    if (!this.currentText) {
      return;
    }

    this.playText(this.currentText);
  }

  restart() {
    MorsePlayer.stop();
    if (this.currentText) {
      this.playText(this.currentText);
    }
  }

  stop() {
    MorsePlayer.stop();
  }

  async dispose() {
    MorsePlayer.stop();
  }
}

export const morseAudio = new MorseAudioEngine();
