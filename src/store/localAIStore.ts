import { create } from 'zustand';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { LOCAL_AI_SYSTEM_PROMPT } from '../ai/prompts';

const LocalAI = NativeModules.LocalAI;
const eventEmitter = LocalAI ? new NativeEventEmitter(LocalAI) : null;

interface LocalAIState {
  modelPath: string | null;
  progress: number;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  isCancelled: boolean;
  prepare: () => Promise<string>;
  loadModel: (path: string) => Promise<boolean>;
  warmup: (systemPrompt: string) => Promise<boolean>;
  initialize: () => Promise<void>;
  generate: (systemPrompt: string, prompt: string, maxTokens?: number) => Promise<string>;
  cancelGenerate: () => void;
}

let initializationPromise: Promise<void> | null = null;
let warmupPromise: Promise<boolean> | null = null;

export const useLocalAIStore = create<LocalAIState>((set, get) => ({
  modelPath: null,
  progress: 0,
  isReady: false,
  isLoading: false,
  error: LocalAI ? null : 'LocalAI native module is not available. Rebuild the app and restart it.',
  isCancelled: false,

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

  warmup: async (systemPrompt: string) => {
    if (!LocalAI) {
      throw new Error('LocalAI native module is not registered or not ready yet.');
    }
    if (!get().isReady) {
      throw new Error('Load the model before warming up.');
    }
    if (warmupPromise) return warmupPromise;

    const request = LocalAI.warmup(systemPrompt).then((warmedUp: boolean) => {
      if (!warmedUp) throw new Error('Cannot cache system prompt.');
      return true;
    }).finally(() => {
      warmupPromise = null;
    });
    warmupPromise = request;

    return request;
  },

  initialize: async () => {
    if (get().isReady || initializationPromise) {
      return initializationPromise || Promise.resolve();
    }

    initializationPromise = (async () => {
      try {
        const path = await get().prepare();
        await get().loadModel(path);
        await get().warmup(LOCAL_AI_SYSTEM_PROMPT);
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

    // Reset cancel flag
    set({ isCancelled: false });

    console.log('📤 [LocalAI] generate called');
    console.log('  systemPrompt:', systemPrompt.substring(0, 100) + '...');
    console.log('  userPrompt:', prompt.substring(0, 200) + '...');
    console.log('  maxTokens:', maxTokens);

    const result = await LocalAI.generate(systemPrompt, prompt, maxTokens);

    // Check if cancelled while waiting
    if (get().isCancelled) {
      console.log('❌ [LocalAI] generate cancelled');
      set({ isCancelled: false });
      throw new Error('CANCELLED');
    }

    console.log('📥 [LocalAI] generate result:', result?.substring(0, 200));
    return result;
  },

  cancelGenerate: () => {
    set({ isCancelled: true });
    // Also stop native inference immediately
    if (LocalAI && LocalAI.stopGenerate) {
      LocalAI.stopGenerate();
    }
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
