import { useEffect } from 'react';
import { musicStore } from '../stores/musicStore';

// Mount once above the routes. Panel visibility never owns the audio lifecycle.
export function useGlobalAudio() {
  useEffect(() => {
    musicStore.initialize();
    return musicStore.dispose;
  }, []);
}
