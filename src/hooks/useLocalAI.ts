import { useState, useEffect, useCallback } from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native';

const LocalAI = NativeModules.LocalAI;
const eventEmitter = LocalAI ? new NativeEventEmitter(LocalAI) : null;

interface UseLocalAIResult {
  modelPath: string | null;
  progress: number;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  prepare: () => Promise<string>;
  loadModel: (path: string) => Promise<boolean>;
  initialize: () => Promise<void>;
  generate: (prompt: string, maxTokens?: number) => Promise<string>;
  testNative: () => Promise<number>;
}

export function useLocalAI(): UseLocalAIResult {
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventEmitter) {
      setError('LocalAI native module is not available. Rebuild the app and restart it.');
      return;
    }

    const subscription = eventEmitter.addListener(
      'MODEL_COPY_PROGRESS',
      (event: { progress: number }) => {
        setProgress(event.progress);
      }
    );

    return () => subscription.remove();
  }, []);

  const prepare = useCallback(async (): Promise<string> => {
    try {
      if (!LocalAI) {
        throw new Error('LocalAI native module is not registered or not ready yet.');
      }

      setIsLoading(true);
      setError(null);
      setProgress(0);

      const path = await LocalAI.prepareModel();
      setModelPath(path);
      return path;
    } catch (err: any) {
      setError(err?.message || 'Failed to prepare model');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testNative = useCallback(async (): Promise<number> => {
    if (!LocalAI) {
      throw new Error('LocalAI native module is not registered or not ready yet.');
    }

    const result = await LocalAI.testNative();
    return result;
  }, []);

  const loadModel = useCallback(async (path: string): Promise<boolean> => {
    if (!LocalAI) {
      throw new Error('LocalAI native module is not registered or not ready yet.');
    }

    const loaded = await LocalAI.loadModel(path);
    setIsReady(loaded);
    return loaded;
  }, []);

  const initialize = useCallback(async (): Promise<void> => {
    try {
      const path = await prepare();
      await loadModel(path);
    } catch {
      // The hook already stores the native error for the UI.
    }
  }, [loadModel, prepare]);

  const generate = useCallback(async (prompt: string, maxTokens = 128): Promise<string> => {
    if (!LocalAI) {
      throw new Error('LocalAI native module is not registered or not ready yet.');
    }

    return LocalAI.generate(prompt, maxTokens);
  }, []);

  return {
    modelPath,
    progress,
    isReady,
    isLoading,
    error,
    prepare,
    loadModel,
    initialize,
    generate,
    testNative,
  };
}
