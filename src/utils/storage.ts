type StorageKind = 'localStorage' | 'sessionStorage';
const fallback = new Map<string, string>();

export function readStorage(key: string, kind: StorageKind = 'localStorage'): string | null {
  const cached = fallback.get(`${kind}:${key}`);
  if (cached !== undefined) return cached;
  try {
    return globalThis[kind]?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string, kind: StorageKind = 'localStorage'): void {
  try {
    const storage = globalThis[kind];
    if (!storage) throw new Error('Storage unavailable');
    storage.setItem(key, value);
    fallback.delete(`${kind}:${key}`);
  } catch {
    // Keep controls usable for this page even when persistence is unavailable.
    fallback.set(`${kind}:${key}`, value);
  }
}
