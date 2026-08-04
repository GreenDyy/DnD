// TODO: Cài @react-native-async-storage/async-storage cho persistent storage

const memoryStore = new Map<string, string>();

export async function setItem(key: string, value: string): Promise<void> {
  memoryStore.set(key, value);
}

export async function getItem(key: string): Promise<string | null> {
  return memoryStore.get(key) ?? null;
}

export async function removeItem(key: string): Promise<void> {
  memoryStore.delete(key);
}

export async function clear(): Promise<void> {
  memoryStore.clear();
}

export const StorageKeys = {
  AUTH_TOKEN: '@auth_token',
  USER: '@user',
} as const;
