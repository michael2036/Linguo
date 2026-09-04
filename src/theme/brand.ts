import { createDarkTheme, createLightTheme, type BrandVariants, type Theme } from '@fluentui/react-components';

// Sky-blue brand ramp, derived from Linguo's own sprite sheet (the mascot's
// background pixels sample to a consistent ~#70b3e1 — see
// src/linguo_sprites.jpeg) rather than picked separately from the
// character, so the mascot and the UI chrome read as one identity instead
// of clashing (a purple app shell around a blue mascot, as it was before).
// Each step keeps the exact lightness/saturation curve of the ramp it
// replaces — only the hue changed — so contrast behavior (button text,
// focus rings, etc.) carries over unchanged.
const brand: BrandVariants = {
  10: '#04121b',
  20: '#082030',
  30: '#0b2b41',
  40: '#103651',
  50: '#144161',
  60: '#194d71',
  70: '#1f5b84',
  80: '#236695',
  90: '#2971a3',
  100: '#307fb5',
  110: '#398cc6',
  120: '#66a2cc',
  130: '#92b8d3',
  140: '#bccfdc',
  150: '#e0e7eb',
  160: '#f4f5f6',
};

export const brandLightTheme: Theme = createLightTheme(brand);
export const brandDarkTheme: Theme = createDarkTheme(brand);

// Accent used sparingly for streaks, celebration states, and the traffic
// light "mastered" glow — kept out of the brand ramp so it reads distinctly
// as a highlight rather than the primary action color.
export const accentAmber = '#F5A623';
export const accentAmberSoftLight = '#FFF4DE';
export const accentAmberSoftDark = '#3A2C0C';
