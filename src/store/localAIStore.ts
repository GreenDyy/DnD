import { create } from 'zustand';
import { NativeEventEmitter, NativeModules } from 'react-native';

const LocalAI = NativeModules.LocalAI;
const eventEmitter = LocalAI ? new NativeEventEmitter(LocalAI) : null;

interface LocalAIState {
  modelPath: string | null;
  progress: number;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  prepare: () => Promise<string>;
  loadModel: (path: string) => Promise<boolean>;
  initialize: () => Promise<void>;
  generate: (systemPrompt: string, prompt: string, maxTokens?: number) => Promise<string>;
}

let initializationPromise: Promise<void> | null = null;

export const useLocalAIStore = create<LocalAIState>((set, get) => ({
  modelPath: null,
  progress: 0,
  isReady: false,
  isLoading: false,
  error: LocalAI ? null : 'LocalAI native module is not available. Rebuild the app and restart it.',

  prepare: async () => {
    if (!LocalAI) {
      const error = new Error('LocalAI native module is not registered or not ready yet.');
      set({ error: error.message });
      throw error;
    }

    try {
      set({ isLoading: true, error: null, progress: 0 });
      const path = await LocalAI.prepareModel();
      set({ modelPath: path });
      return path;
    } catch (error: any) {
      set({ error: error?.message || 'Failed to prepare model' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loadModel: async (path: string) => {
    if (!LocalAI) {
      const error = new Error('LocalAI native module is not registered or not ready yet.');
      set({ error: error.message });
      throw error;
    }

    try {
      set({ error: null });
      const loaded = await LocalAI.loadModel(path);
      set({ isReady: loaded });
      return loaded;
    } catch (error: any) {
      set({ isReady: false, error: error?.message || 'Failed to load model' });
      throw error;
    }
  },

  initialize: async () => {
    if (get().isReady || initializationPromise) {
      return initializationPromise || Promise.resolve();
    }

    initializationPromise = (async () => {
      try {
        const path = await get().prepare();
        await get().loadModel(path);
      } finally {
        initializationPromise = null;
      }
    })();

    return initializationPromise;
  },

  generate: async (systemPrompt: string, prompt: string, maxTokens = 128) => {
    if (!LocalAI) {
      throw new Error('LocalAI native module is not registered or not ready yet.');
    }
    if (!get().isReady) {
      throw new Error('Load the model before generating text.');
    }

    console.log('📤 [LocalAI] generate called');
    console.log('  systemPrompt:', systemPrompt.substring(0, 100) + '...');
    console.log('  userPrompt:', prompt.substring(0, 200) + '...');
    console.log('  maxTokens:', maxTokens);

    const result = await LocalAI.generate(systemPrompt, prompt, maxTokens);

    console.log('📥 [LocalAI] generate result:', result?.substring(0, 200));
    return result;
  },

}));

if (eventEmitter) {
  eventEmitter.addListener(
    'MODEL_COPY_PROGRESS',
    (event: { progress: number }) => setProgress(event.progress),
  );
}

function setProgress(progress: number) {
  useLocalAIStore.setState({ progress });
}
