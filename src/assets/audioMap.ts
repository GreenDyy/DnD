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

const soundCache: Record<string, Sound> = {};
const soundLoadCache: Record<string, Promise<Sound> | undefined> = {};
let activeSound: Sound | null = null;
let activeResolve: (() => void) | null = null;
let stopTimer: ReturnType<typeof setTimeout> | null = null;

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

  const candidate = candidates.find(item => !item) ?? source;
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

// Ngắt âm êm ái: hạ volume -> stop -> reset con trỏ
function safelyStopSound(sound: Sound, callback?: () => void) {
  try {
    sound.setVolume(0);
    sound.stop(() => {
      sound.setCurrentTime(0);
      sound.setVolume(1.0); // Trả lại volume bình thường cho lần phát sau
      callback?.();
    });
  } catch {
    callback?.();
  }
}

export async function playCharacterAudio(
  char: string,
  speed: number = 1,
): Promise<void> {
  // Dừng âm trước đó nếu còn đang sót lại
  stopCharacterAudio();

  const normalized = char.toUpperCase();
  const nativeName =
    getCharacterAudioName(normalized) ?? getCharacterAudioName('A') ?? 'a';

  const sound = await loadSound(nativeName);
  activeSound = sound;

  sound.setSpeed(speed);
  sound.setVolume(1.0);

  // Tăng thời lượng lên 800ms để âm thanh phát trọn vẹn hơn
  const PLAY_DURATION_MS = Math.round(800 / speed);

  await new Promise<void>(resolve => {
    activeResolve = resolve;
    let isFinished = false;

    const finish = () => {
      if (isFinished) return;
      isFinished = true;

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

    sound.setCurrentTime(0);

    sound.play(() => {
      // Kích hoạt khi file tự phát hết tự nhiên
      finish();
    });

    // Ngắt êm sau thời gian quy định
    stopTimer = setTimeout(() => {
      if (!isFinished) {
        safelyStopSound(sound, finish);
      }
    }, PLAY_DURATION_MS);
  });
}

export function stopCharacterAudio(): void {
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }

  if (activeSound) {
    const soundToStop = activeSound;
    activeSound = null;
    safelyStopSound(soundToStop, () => {
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
