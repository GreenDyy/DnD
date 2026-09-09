import Sound from 'react-native-sound';

Sound.setCategory('Playback');

// file nằm trong android/app/src/main/res/raw/ => Sound('filename', Sound.MAIN_BUNDLE)
export const characterAudioNameMap: Record<string, string> = {
  A: 'a',
  B: 'b',
  C: 'c',
  D: 'd',
  E: 'e',
  F: 'f',
  G: 'g',
  H: 'h',
  I: 'i',
  J: 'j',
  K: 'k',
  L: 'l',
  M: 'm',
  N: 'n',
  O: 'o',
  P: 'p',
  Q: 'q',
  R: 'r',
  S: 's',
  T: 't',
  U: 'u',
  V: 'v',
  W: 'w',
  X: 'x',
  Y: 'y',
  Z: 'z',
  '0': 'n0',
  '1': 'n1',
  '2': 'n2',
  '3': 'n3',
  '4': 'n4',
  '5': 'n5',
  '6': 'n6',
  '7': 'n7',
  '8': 'n8',
  '9': 'n9',
};

// Tạo một bộ nhớ đệm để lưu các đối tượng Sound đã được tải, tránh tải lại nhiều lần cùng một âm thanh.
const soundCache: Record<string, Sound> = {};
const soundLoadCache: Record<string, Promise<Sound> | undefined> = {};
let activeSound: Sound | null = null;

// Lấy tên tệp âm thanh cho ký tự đã cho, nếu không có thì trả về undefined
export function getCharacterAudioName(char: string): string | undefined {
  return characterAudioNameMap[char.toUpperCase()];
}

function loadSound(source: string): Promise<Sound> {
  const candidates = [source, `${source}.mp3`, source.replace(/\.mp3$/i, '')];

  for (const candidate of candidates) {
    const cacheKey = `native:${candidate}`;

    if (soundCache[cacheKey]) {
      return Promise.resolve(soundCache[cacheKey]);
    }

    if (Object.prototype.hasOwnProperty.call(soundLoadCache, cacheKey)) {
      return soundLoadCache[cacheKey] as Promise<Sound>;
    }
  }

  const candidate = candidates.find(item => !!item) ?? source;
  const cacheKey = `native:${candidate}`;

  const loadPromise = new Promise<Sound>((resolve, reject) => {
    const sound = new Sound(candidate, Sound.MAIN_BUNDLE, error => {
      if (error) {
        const fallback = candidates.find(item => item !== candidate);

        if (fallback) {
          delete soundLoadCache[cacheKey];
          loadSound(fallback).then(resolve).catch(reject);
          return;
        }

        reject(error);
        return;
      }

      soundCache[cacheKey] = sound;
      delete soundLoadCache[cacheKey];
      resolve(sound);
    });

    if (!sound) {
      delete soundLoadCache[cacheKey];
      reject(new Error(`Sound object is null for ${candidate}`));
    }
  });

  soundLoadCache[cacheKey] = loadPromise;
  return loadPromise;
}

let activeResolve: (() => void) | null = null;
let stopTimer: ReturnType<typeof setTimeout> | null = null;

// Phát âm thanh cho ký tự đã cho, trả về một Promise để xử lý kết quả
export async function playCharacterAudio(
  char: string,
  speed: number = 1,
): Promise<void> {
  const normalized = char.toUpperCase();
  const nativeName =
    getCharacterAudioName(normalized) ?? getCharacterAudioName('A') ?? 'a';

  const sound = await loadSound(nativeName);
  activeSound = sound;
  sound.setSpeed(speed);

  // Chỉ lấy 0.7s (700ms) đầu. Khi tăng tốc (speed > 1), thời gian sẽ co lại tương ứng
  const PLAY_DURATION_MS = Math.round(700 / speed);

  await new Promise<void>(resolve => {
    activeResolve = resolve;

    const cleanup = () => {
      if (stopTimer) {
        clearTimeout(stopTimer);
        stopTimer = null;
      }
      activeSound = null;
      if (activeResolve) {
        activeResolve();
        activeResolve = null;
      }
    };

    sound.stop(() => {
      sound.play(_success => {
        // Kích hoạt nếu file kết thúc trước 0.5s
        cleanup();
      });

      // Tự ngắt sau 0.5s đầu để bỏ đoạn im lặng phía sau
      stopTimer = setTimeout(() => {
        sound.stop(() => {
          cleanup();
        });
      }, PLAY_DURATION_MS);
    });
  });
}

export function stopCharacterAudio(): void {
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
  if (activeSound) {
    activeSound.stop(() => {
      activeSound = null;
      if (activeResolve) {
        activeResolve();
        activeResolve = null;
      }
    });
  } else if (activeResolve) {
    activeResolve();
    activeResolve = null;
  }
}
