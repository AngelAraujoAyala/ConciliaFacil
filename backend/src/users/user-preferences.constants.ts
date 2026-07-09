export const DEFAULT_USER_PREFERENCES = {
  theme: 'light',
  timezone: 'America/Mexico_City',
  emailNotifications: true,
  defaultRfc: null as string | null,
} as const;

export type UserPreferencesResponse = {
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  emailNotifications: boolean;
  defaultRfc?: string;
};
