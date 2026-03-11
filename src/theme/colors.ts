// Primary renk: orange (#f97316) — HSL(24,95%,53%) => hex ~#f97316
// Muted, border, card, background renkleri tanımlı

export const lightColors = {
  background: '#ffffff',
  foreground: '#374151',       // HSL 220 13% 28%
  card: '#ffffff',
  cardForeground: '#374151',
  primary: '#f97316',          // HSL 24 95% 53%
  primaryForeground: '#ffffff',
  secondary: '#fff7ed',        // HSL 30 100% 96%
  secondaryForeground: '#374151',
  muted: '#f3f4f6',            // HSL 220 14% 96%
  mutedForeground: '#6b7280',  // HSL 220 9% 46%
  accent: '#fff7ed',
  accentForeground: '#374151',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  border: '#e5e7eb',           // HSL 220 13% 91%
  input: '#e5e7eb',
  ring: '#f97316',
};

export const darkColors = {
  background: '#111827',       // HSL 220 20% 10%
  foreground: '#e5e7eb',       // HSL 220 14% 90%
  card: '#1f2937',             // HSL 220 18% 13%
  cardForeground: '#e5e7eb',
  primary: '#f97316',
  primaryForeground: '#ffffff',
  secondary: '#374151',        // HSL 220 16% 18%
  secondaryForeground: '#e5e7eb',
  muted: '#374151',
  mutedForeground: '#9ca3af',  // HSL 220 9% 55%
  accent: '#374151',
  accentForeground: '#e5e7eb',
  destructive: '#7f1d1d',
  destructiveForeground: '#e5e7eb',
  border: '#374151',           // HSL 220 16% 22%
  input: '#374151',
  ring: '#f97316',
};

export type Colors = typeof lightColors;
