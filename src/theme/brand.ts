import { createDarkTheme, createLightTheme, type BrandVariants, type Theme } from '@fluentui/react-components';

// Indigo-violet brand ramp — distinct from Fluent's default blue, gives the
// app its own identity while staying within Fluent's token system so every
// component (buttons, focus rings, links) picks it up automatically.
const brand: BrandVariants = {
  10: '#09041b',
  20: '#110830',
  30: '#180b41',
  40: '#1f1051',
  50: '#261461',
  60: '#2d1971',
  70: '#371f84',
  80: '#3d2395',
  90: '#4529a3',
  100: '#4f30b5',
  110: '#5a39c6',
  120: '#7e66cc',
  130: '#a192d3',
  140: '#c3bcdc',
  150: '#e3e0eb',
  160: '#f4f4f6',
};

export const brandLightTheme: Theme = createLightTheme(brand);
export const brandDarkTheme: Theme = createDarkTheme(brand);

// Accent used sparingly for streaks, celebration states, and the traffic
// light "mastered" glow — kept out of the brand ramp so it reads distinctly
// as a highlight rather than the primary action color.
export const accentAmber = '#F5A623';
export const accentAmberSoftLight = '#FFF4DE';
export const accentAmberSoftDark = '#3A2C0C';
