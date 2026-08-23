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
  prepare: () => Promise<void>;
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

  const prepare = useCallback(async () => {
    try {
      if (!LocalAI) {
        throw new Error('LocalAI native module is not registered or not ready yet.');
      }

      setIsLoading(true);
      setError(null);
      setProgress(0);

      const path = await LocalAI.prepareModel();
      setModelPath(path);
      setIsReady(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to prepare model');
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

  return {
    modelPath,
    progress,
    isReady,
    isLoading,
    error,
    prepare,
    testNative,
  };
}
