// Single source of truth for app branding. Change here, reflects everywhere
// (screen headers, tab titles, splash text) with no other file edits.
export const appConfig = {
  appName: 'Tazkiyah',
  tagline: 'A journey of self-purification, together.',
  version: '1.0.0',
  logo: null as string | null, // path to logo asset, if/when added
  defaultChallengeDurationDays: 21,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
};

export type AppConfig = typeof appConfig;
