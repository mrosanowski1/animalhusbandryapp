import { router } from 'expo-router';

import { deleteToken, getToken } from './storage';

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    await deleteToken();
    router.replace('/login');
  }

  return response;
}
