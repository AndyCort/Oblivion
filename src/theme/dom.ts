/** Self-contained so the same function can run before the application loads. */
export function applyThemeDocument(mode: 'light' | 'dark', style: string, color: string): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  root.setAttribute('data-card-style', style);
  root.style.colorScheme = mode;
  document.getElementById('theme-color-meta')?.setAttribute('content', color);
}
