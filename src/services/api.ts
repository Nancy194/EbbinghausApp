import type { PersistedData } from '../types';

const PROD_API = 'https://ebbinghaus-api.onrender.com/api';
const DEV_API = 'http://192.168.31.119:3001/api';

const API_BASE = typeof __DEV__ !== 'undefined' && __DEV__ ? DEV_API : PROD_API;

interface AuthResponse {
  nickname: string;
  created_at: string;
  isNew: boolean;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export function loginOrRegister(nickname: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth', {
    method: 'POST',
    body: JSON.stringify({ nickname }),
  });
}

export function fetchData(nickname: string): Promise<PersistedData> {
  return request<PersistedData>(`/data?nickname=${encodeURIComponent(nickname)}`);
}

export function syncData(nickname: string, data: PersistedData): Promise<void> {
  return request('/data', {
    method: 'PUT',
    body: JSON.stringify({ nickname, ...data }),
  });
}
