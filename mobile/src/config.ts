const fallbackApiUrl = 'http://localhost:8000';

export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? fallbackApiUrl,
} as const;