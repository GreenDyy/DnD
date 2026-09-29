import { useState, useCallback, useEffect, useRef } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { VoiceRecognition } = NativeModules;

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef(transcript);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Native event listeners
  useEffect(() => {
  if (!VoiceRecognition) return;

  const onSpeechStart = () => {
    setIsListening(true);
    setError(null);
  };

  const onSpeechRecognized = (e: any) => {
    const text = e?.value?.[0] ?? '';
    setTranscript(text);
  };

  const onSpeechPartialResults = (e: any) => {
    const text = e?.value?.[0] ?? '';
    setTranscript(text);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const onSpeechError = (e: any) => {
    const msg = e?.message ?? 'Speech recognition error';
    setError(msg);
    setIsListening(false);
  };

  const emitter = new NativeEventEmitter(VoiceRecognition);

  const subscriptions = [
    emitter.addListener('onSpeechStart', onSpeechStart),
    emitter.addListener('onSpeechRecognized', onSpeechRecognized),
    emitter.addListener('onSpeechPartialResults', onSpeechPartialResults),
    emitter.addListener('onSpeechEnd', onSpeechEnd),
    emitter.addListener('onSpeechError', onSpeechError),
  ];

  return () => {
    subscriptions.forEach(subscription => subscription.remove());
  };
}, []);

  const startListening = useCallback(async () => {
    if (!VoiceRecognition) {
      setError('Native module not available');
      return;
    }
    setTranscript('');
    setError(null);
    try {
      await VoiceRecognition.startListening();
    } catch (err: any) {
      setError(err.message ?? 'Failed to start listening');
    }
  }, []);

  const stopListening = useCallback(async () => {
    if (!VoiceRecognition) return;
    try {
      await VoiceRecognition.stopListening();
    } catch (err) {
      // ignore
    }
  }, []);

  const cancelListening = useCallback(async () => {
    if (!VoiceRecognition) return;
    try {
      await VoiceRecognition.cancelListening();
      setTranscript('');
    } catch (err) {
      // ignore
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    cancelListening,
  };
}