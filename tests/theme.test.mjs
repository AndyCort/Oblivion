import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { typescriptUrl, moduleUrl } from './load-typescript.mjs';

const tokensUrl = await typescriptUrl('../src/config/themes/tokens.ts');
const presetImports = { './themes/tokens': tokensUrl };
for (const name of ['base', 'glass', 'flat', 'neo', 'expressive']) {
  presetImports[`./themes/${name}`] = await typescriptUrl(`../src/config/themes/${name}.ts`, { './tokens': tokensUrl });
}
const configUrl = await typescriptUrl('../src/config/theme.config.ts', presetImports);
const modelUrl = await typescriptUrl('../src/theme/model.ts', { '../config/theme.config': configUrl });
const domUrl = await typescriptUrl('../src/theme/dom.ts');
const model = await import(modelUrl);
const { cardStyles } = await import(configUrl);
const validateUrl = await typescriptUrl('../src/theme/validate.ts', { '../config/theme.config': configUrl });
const { validatePresets } = await import(validateUrl);
const build = await import(await typescriptUrl('../src/theme/build.ts', {
  '../config/theme.config': configUrl, './model': modelUrl, './dom': domUrl, './validate': validateUrl,
}));
function browser(saved = {}, blocked = false) {
  const attributes = {};
  const writes = { storage: 0, dom: 0 };
  const style = {};
  const meta = {};
  const systemListeners = new Set();
  const storageListeners = new Set();
  const media = { matches: false, addEventListener: (_, fn) => systemListeners.add(fn), removeEventListener: (_, fn) => systemListeners.delete(fn) };
  const localStorage = { getItem(key) { if (blocked) throw new Error('blocked'); return saved[key] ?? null; }, setItem(key, value) { writes.storage++; if (blocked) throw new Error('blocked'); saved[key] = value; } };
  const document = { documentElement: { setAttribute: (key, value) => { writes.dom++; attributes[key] = value; }, style }, getElementById: () => ({ setAttribute: (key, value) => meta[key] = value }) };
  const window = { localStorage, matchMedia: () => media, addEventListener: (_, fn) => storageListeners.add(fn), removeEventListener: (_, fn) => storageListeners.delete(fn) };
  return { writes, document, window, localStorage, matchMedia: window.matchMedia, attributes, style, meta, media, systemListeners, storageListeners };
}

test('every preset resolves complete light/dark tokens and isolated card selectors', () => {
  const css = build.buildThemeCss();
  for (const preset of cardStyles) {
    for (const mode of ['light', 'dark']) {
      const tokens = model.resolveTokens(preset.id, mode);
      assert.ok(tokens['bg-3']);
      assert.ok(tokens['main-color']);
      assert.equal(Object.keys(tokens).length, 16);
      assert.ok(css.includes(`data-card-style="${preset.id}"][data-theme="${mode}"]`));
    }
  }
  assert.ok(css.includes('[data-card=""]'));
  assert.ok(!css.includes(' :not(html)[data-card]'));
  assert.ok(!css.includes('oklch(var('));
});

test('bootstrap validates saved values, handles blocked storage and matches all preset colors', () => {
  for (const saved of [{}, { theme: 'bogus', 'card-style': '__proto__' }, ...cardStyles.flatMap(p => ['light', 'dark', 'system'].map(theme => ({ theme, 'card-style': p.id })))]) {
    for (const dark of [false, true]) {
      const env = browser(saved);
      env.media.matches = dark;
      vm.runInNewContext(build.buildThemeScript(), env);
      const mode = model.resolveMode(model.isThemeId(saved.theme) ? saved.theme : 'system', dark);
      const style = model.isCardStyleId(saved['card-style']) ? saved['card-style'] : 'glass';
      assert.equal(env.attributes['data-theme'], mode);
      assert.equal(env.attributes['data-card-style'], style);
      assert.equal(env.meta.content, model.resolveTokens(style, mode)['bg-0']);
      assert.equal(env.style.colorScheme, mode);
    }
  }
  const env = browser({}, true);
  vm.runInNewContext(build.buildThemeScript(), env);
  assert.equal(env.attributes['data-card-style'], 'glass');
});

test('store follows OS, persists choices, synchronizes storage and cleans up listeners', async () => {
  const env = browser({ theme: 'system' });
  const original = Object.fromEntries(['window', 'document', 'localStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of Object.keys(original)) Object.defineProperty(globalThis, key, { value: env[key], configurable: true });
  try {
    const storageUrl = await typescriptUrl('../src/utils/storage.ts');
    const store = await import(await typescriptUrl('../src/stores/themeStore.ts', {
      react: moduleUrl('export function useSyncExternalStore() {}'), '../utils/storage': storageUrl,
      '../theme/model': modelUrl, '../theme/dom': domUrl,
    }));
    const dispose = store.initTheme();
    assert.equal(store.initTheme(), dispose);
    assert.equal(env.systemListeners.size, 1);
    let changes = 0;
    const unsubscribe = store.subscribeTheme(() => changes++);
    const before = store.getThemeSnapshot();
    env.media.matches = true;
    env.systemListeners.forEach(fn => fn());
    assert.equal(store.getTheme(), 'system');
    assert.equal(store.getThemeSnapshot().effectiveTheme, 'dark');
    assert.notEqual(store.getThemeSnapshot(), before);
    assert.equal(changes, 1);
    const unchanged = store.getThemeSnapshot();
    const previousWrites = { ...env.writes };
    store.setTheme('system');
    store.setCardStyle('glass');
    assert.equal(store.getThemeSnapshot(), unchanged);
    assert.deepEqual(env.writes, previousWrites);
    assert.equal(changes, 1);
    store.setTheme('light');
    assert.equal(env.localStorage.getItem('theme'), 'light');
    const manualWrites = { ...env.writes };
    env.systemListeners.forEach(fn => fn());
    assert.equal(store.getThemeSnapshot().effectiveTheme, 'light');
    assert.deepEqual(env.writes, manualWrites);
    store.setCardStyle('expressive');
    assert.equal(env.meta.content, model.resolveTokens('expressive', 'light')['bg-0']);
    env.storageListeners.forEach(fn => fn({ storageArea: env.localStorage, key: 'theme', newValue: 'dark' }));
    assert.equal(store.getThemeSnapshot().effectiveTheme, 'dark');
    env.storageListeners.forEach(fn => fn({ storageArea: env.localStorage, key: null }));
    assert.equal(store.getTheme(), 'system');
    assert.equal(store.getCardStyle(), 'glass');
    env.localStorage.setItem = () => { throw new Error('blocked'); };
    store.setTheme('dark');
    store.setCardStyle('neo');
    assert.equal(store.getThemeSnapshot().effectiveTheme, 'dark');
    assert.equal(env.attributes['data-card-style'], 'neo');
    // A newer cross-tab value must survive teardown/reinitialization after a failed write.
    env.localStorage.getItem = key => key === 'theme' ? 'light' : 'flat';
    env.storageListeners.forEach(fn => fn({ storageArea: env.localStorage, key: 'theme', newValue: 'light' }));
    env.storageListeners.forEach(fn => fn({ storageArea: env.localStorage, key: 'card-style', newValue: 'flat' }));
    dispose();
    const disposeAgain = store.initTheme();
    assert.equal(store.getTheme(), 'light');
    assert.equal(store.getCardStyle(), 'flat');
    dispose(); // Stale cleanup cannot detach the newer initialization.
    assert.equal(store.initTheme(), disposeAgain);
    assert.equal(env.systemListeners.size, 1);
    disposeAgain();
    unsubscribe();
    dispose();
    assert.equal(env.systemListeners.size, 0);
    assert.equal(env.storageListeners.size, 0);
  } finally {
    for (const [key, descriptor] of Object.entries(original)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
});


test('registry rejects duplicate IDs, unsafe selectors, missing defaults and bad tokens', () => {
  const preset = structuredClone(cardStyles[0]);
  assert.doesNotThrow(() => validatePresets(cardStyles, 'glass'));
  assert.throws(() => validatePresets([preset, preset], preset.id), /Duplicate/);
  assert.throws(() => validatePresets([{ ...preset, id: 'bad"id' }], preset.id), /Invalid/);
  assert.throws(() => validatePresets([preset], 'missing'), /Default/);
  const missing = structuredClone(preset);
  delete missing.light['bg-3'];
  assert.throws(() => validatePresets([missing], preset.id), /Missing.*bg-3/);
  assert.throws(() => validatePresets([{ ...preset, dark: { 'text-1': ' ' } }], preset.id), /Empty/);
  assert.throws(() => validatePresets([{ ...preset, dark: { 'typo-color': 'red' } }], preset.id), /Unknown/);
});
test('background images cannot occupy color-only theme tokens', () => {
  const preset = structuredClone(cardStyles[0]);
  for (const key of ['bg-0', 'text-1', 'main-color', 'on-main', 'home-bg-filter', 'wave-bg']) {
    assert.throws(() => validatePresets([{ ...preset, dark: { [key]: 'linear-gradient(red, blue)' } }], preset.id), /Expected color/);
  }
  assert.doesNotThrow(() => validatePresets([{ ...preset, dark: { 'main-bg': 'linear-gradient(red, blue)' } }], preset.id));
});
