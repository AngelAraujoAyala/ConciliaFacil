export const DEFAULT_USER_PREFERENCES = {
  theme: 'light',
} as const;

export type UserPreferencesResponse = {
  theme: 'light' | 'dark';
};
