import { useEffect, useSyncExternalStore } from 'react';

interface ResourceState<T> {
  data: T;
  loading: boolean;
  error: boolean;
}

/**
 * 全局共享的请求缓存：同一资源在多个组件中只发起一次请求，
 * 超过 maxAge 后再次挂载时自动刷新。
 */
export function createSharedResource<T>(fetcher: () => Promise<T>, initial: T, maxAge = 60_000) {
  let snapshot: ResourceState<T> = { data: initial, loading: true, error: false };
  let loadedAt = 0;
  let pending: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  const getSnapshot = () => snapshot;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };
  const update = (next: ResourceState<T>) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  function refresh(): Promise<void> {
    if (pending) return pending;
    update({ ...snapshot, loading: true, error: false });
    pending = fetcher()
      .then((data) => {
        loadedAt = Date.now();
        update({ data, loading: false, error: false });
      })
      .catch((error: unknown) => {
        console.error('Unable to load resource', error);
        update({ ...snapshot, loading: false, error: true });
      })
      .finally(() => { pending = null; });
    return pending;
  }

  function useResource() {
    const state = useSyncExternalStore(subscribe, getSnapshot);
    useEffect(() => {
      if (!loadedAt || Date.now() - loadedAt > maxAge) void refresh();
    }, []);
    return { ...state, retry: refresh };
  }

  return { useResource, refresh };
}
