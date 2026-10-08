// Farbtöne je Kategorie für Karten und Hero. Tintenblau und Bernstein,
// abgeleitet aus den Tokens in src/styles/global.css.
export const tint: Record<string, { from: string; to: string; ink: string }> = {
  saugroboter: { from: '#e3eaf7', to: '#c3d3ed', ink: '#1b3a6b' },
  wischroboter: { from: '#dfeef2', to: '#bcdce4', ink: '#145563' },
  allgemein: { from: '#fbeed4', to: '#f2c87e', ink: '#94600a' },
};
