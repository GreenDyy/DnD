import Sound from 'react-native-sound';

Sound.setCategory('Playback');

// Cách 1: file nằm trong JS bundle (src/assets/audio/...) => require()
export const characterAudioMap: Record<string, number> = {
  A: require('./audio/letters/A.mp3'),
  B: require('./audio/letters/B.mp3'),
  C: require('./audio/letters/C.mp3'),
  D: require('./audio/letters/D.mp3'),
  E: require('./audio/letters/E.mp3'),
  F: require('./audio/letters/F.mp3'),
  G: require('./audio/letters/G.mp3'),
  H: require('./audio/letters/H.mp3'),
  I: require('./audio/letters/I.mp3'),
  J: require('./audio/letters/J.mp3'),
  K: require('./audio/letters/K.mp3'),
  L: require('./audio/letters/L.mp3'),
  M: require('./audio/letters/M.mp3'),
  N: require('./audio/letters/N.mp3'),
  O: require('./audio/letters/O.mp3'),
  P: require('./audio/letters/P.mp3'),
  Q: require('./audio/letters/Q.mp3'),
  R: require('./audio/letters/R.mp3'),
  S: require('./audio/letters/S.mp3'),
  T: require('./audio/letters/T.mp3'),
  U: require('./audio/letters/U.mp3'),
  V: require('./audio/letters/V.mp3'),
  W: require('./audio/letters/W.mp3'),
  X: require('./audio/letters/X.mp3'),
  Y: require('./audio/letters/Y.mp3'),
  Z: require('./audio/letters/Z.mp3'),
  '0': require('./audio/numbers/0.mp3'),
  '1': require('./audio/numbers/1.mp3'),
  '2': require('./audio/numbers/2.mp3'),
  '3': require('./audio/numbers/3.mp3'),
  '4': require('./audio/numbers/4.mp3'),
  '5': require('./audio/numbers/5.mp3'),
  '6': require('./audio/numbers/6.mp3'),
  '7': require('./audio/numbers/7.mp3'),
  '8': require('./audio/numbers/8.mp3'),
  '9': require('./audio/numbers/9.mp3'),
};

// Cách 2: file nằm trong android/app/src/main/res/raw/ => Sound('filename', Sound.MAIN_BUNDLE)
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
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
};

const soundCache: Record<string, Sound> = {};

export function getCharacterAudio(char: string): number | undefined {
  return characterAudioMap[char.toUpperCase()];
}

export function getCharacterAudioOrFallback(char: string): number {
  const normalized = char.toUpperCase();
  return characterAudioMap[normalized] ?? characterAudioMap.A;
}

export function getCharacterAudioName(char: string): string | undefined {
  return characterAudioNameMap[char.toUpperCase()];
}

function loadAndPlaySound(
  source: number | string,
  mode: 'bundle' | 'native',
  char: string,
  resolve: () => void,
  reject: (reason?: unknown) => void,
) {
  const cacheKey = `${mode}:${String(source)}`;
  const cachedSound = soundCache[cacheKey];

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
    console.log('[audioMap] Reuse cached sound:', source, 'mode:', mode);
    play(cachedSound);
    return;
  }

  const sound = new Sound(
    source as number,
    mode === 'native' ? Sound.MAIN_BUNDLE : undefined,
    error => {
      if (error) {
        console.log(
          '[audioMap] Sound load failed for:',
          source,
          'mode:',
          mode,
          'error:',
          error,
        );
        reject(error);
        return;
      }

      console.log(
        '[audioMap] Sound loaded successfully:',
        source,
        'mode:',
        mode,
      );
      soundCache[cacheKey] = sound;
      play(sound);
    },
  );

  if (!sound) {
    console.log('[audioMap] Sound object is null for:', source, 'mode:', mode);
  }
}

export function playCharacterAudio(char: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const normalized = char.toUpperCase();
    const bundleSource =
      getCharacterAudio(normalized) ?? getCharacterAudioOrFallback(normalized);
    const nativeName =
      getCharacterAudioName(normalized) ?? getCharacterAudioName('A') ?? 'A';

    if (!bundleSource) {
      console.log('[audioMap] No bundle source for char:', char);
      resolve();
      return;
    }

    const tryNativeFallback = () => {
      console.log('[audioMap] Fallback to native resource:', nativeName);
      loadAndPlaySound(nativeName, 'native', char, resolve, reject);
    };

    try {
      loadAndPlaySound(
        bundleSource,
        'bundle',
        char,
        resolve,
        (error: unknown) => {
          console.log(
            '[audioMap] Bundle path failed, trying raw resource fallback',
          );
          tryNativeFallback();
        },
      );
    } catch (error) {
      console.log(
        '[audioMap] Bundle load exception, trying raw resource fallback:',
        error,
      );
      tryNativeFallback();
    }
  });
}
