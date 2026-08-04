import { useCallback, useState } from 'react';
import * as authApi from './api';
import type { LoginPayload, RegisterPayload } from './types';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      return await authApi.login(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error };
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      return await authApi.register(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Register failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading, error };
}
