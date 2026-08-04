import type { AuthResponse, LoginPayload, RegisterPayload } from './types';

// TODO: Kết nối API thật qua services/api
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return {
    token: 'mock-token',
    user: {
      id: '1',
      email: payload.email,
      name: 'User',
    },
  };
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  return {
    token: 'mock-token',
    user: {
      id: '1',
      email: payload.email,
      name: payload.name,
    },
  };
}
