import { useEffect, useSyncExternalStore } from 'react';
import { fetchMoments, type Moment } from '../api/moments';

let snapshot: { moments: Moment[]; loading: boolean; error: boolean } = {
  moments: [], loading: true, error: false,
};
let loadedAt = 0;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();
const getSnapshot = () => snapshot;
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
function update(next: typeof snapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function refreshMoments(): Promise<void> {
  if (pending) return pending;
  update({ ...snapshot, loading: true, error: false });
  pending = fetchMoments()
    .then((moments) => {
      loadedAt = Date.now();
      update({ moments, loading: false, error: false });
    })
    .catch(() => { update({ ...snapshot, loading: false, error: true }); })
    .finally(() => { pending = null; });
  return pending;
}

/** Share one request between the timeline, statistics, latest moment and calendar. */
export function useMoments() {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  useEffect(() => {
    if (!loadedAt || Date.now() - loadedAt > 60_000) void refreshMoments();
  }, []);
  return { ...state, retry: refreshMoments };
}
