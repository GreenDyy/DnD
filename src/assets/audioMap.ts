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

// Lấy tên tệp âm thanh cho ký tự đã cho, nếu không có thì trả về undefined
export function getCharacterAudioName(char: string): string | undefined {
  return characterAudioNameMap[char.toUpperCase()];
}

// Tải và phát âm thanh cho ký tự đã cho, sử dụng bộ nhớ đệm để tránh tải lại nhiều lần
function loadAndPlaySound(
  source: number | string,
  mode: 'bundle' | 'native',
  char: string,
  resolve: () => void,
  reject: (reason?: unknown) => void,
) {
  const cacheKey = `${mode}:${String(source)}`;
  const cachedSound = soundCache[cacheKey];

  // Hàm phụ trợ để phát âm thanh và xử lý kết quả
  const play = (sound: Sound) => {
    sound.stop(() => {
      sound.play(success => {
        if (!success) {
          reject(new Error(`Không phát được âm thanh cho ký tự: ${char}`));
          return;
        }
        resolve();
      });
    });
  };

  if (cachedSound) {
    play(cachedSound);
    return;
  }

  // Nếu chưa có trong bộ nhớ đệm, tạo một đối tượng Sound mới và tải âm thanh
  const sound = new Sound(
    source as number,
    mode === 'native' ? Sound.MAIN_BUNDLE : undefined,
    error => {
      if (error) {
        console.error('[audioMap] Sound load failed:', {
          source,
          mode,
          char,
          error,
        });
        reject(error);
        return;
      }

      soundCache[cacheKey] = sound;
      play(sound);
    },
  );

  if (!sound) {
    console.error('[audioMap] Sound object is null:', { source, mode, char });
  }
}

// Phát âm thanh cho ký tự đã cho, trả về một Promise để xử lý kết quả
export function playCharacterAudio(char: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const normalized = char.toUpperCase();
    // const bundleSource =
    //   getCharacterAudio(normalized) ?? getCharacterAudioOrFallback(normalized);
    const nativeName =
      getCharacterAudioName(normalized) ?? getCharacterAudioName('A') ?? 'a';

    const tryNativeFallback = () => {
      loadAndPlaySound(nativeName, 'native', char, resolve, reject);
    };

    tryNativeFallback();
  });
}
