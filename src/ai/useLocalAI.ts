import { useState, useEffect, useCallback } from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native';

const { LocalAI } = NativeModules;
const eventEmitter = new NativeEventEmitter(LocalAI);

interface UseLocalAIResult {
  modelPath: string | null;
  progress: number;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  prepare: () => Promise<void>;
}

export function useLocalAI(): UseLocalAIResult {
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      setIsLoading(true);
      setError(null);
      setProgress(0);

      const path = await LocalAI.prepareModel();
      setModelPath(path);
      setIsReady(true);
    } catch (err: any) {
      setError(err.message || 'Failed to prepare model');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    modelPath,
    progress,
    isReady,
    isLoading,
    error,
    prepare,
  };
}
