import { defaultLight, type StylePreset } from '../config/theme.config';

/** Fail at build time instead of silently emitting broken theme selectors or tokens. */
export function validatePresets(presets: readonly StylePreset[], defaultId: string): void {
  const ids = new Set<string>();
  const keys = Object.keys(defaultLight);
  for (const preset of presets) {
    if (!/^[a-z][a-z0-9-]*$/.test(preset.id)) throw new Error(`Invalid theme id: ${preset.id}`);
    if (ids.has(preset.id)) throw new Error(`Duplicate theme id: ${preset.id}`);
    ids.add(preset.id);
    for (const mode of ['light', 'dark'] as const) {
      const tokens = preset[mode];
      for (const [key, value] of Object.entries(tokens)) {
        if (!keys.includes(key)) throw new Error(`Unknown theme token: ${preset.id}.${mode}.${key}`);
        if (typeof value !== 'string' || !value.trim()) throw new Error(`Empty theme token: ${preset.id}.${mode}.${key}`);
      }
    }
    for (const key of keys) {
      if (!(key in preset.light)) throw new Error(`Missing theme token: ${preset.id}.light.${key}`);
    }
  }
  if (!ids.has(defaultId)) throw new Error(`Default theme is not registered: ${defaultId}`);
}
