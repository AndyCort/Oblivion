function getMusicUrl(filename: string) {
    return new URL(`../assets/music/${filename}`, import.meta.url).href;
}

export interface Track {
    name: string;
    artist_name: string;
    audio: string;
}

const defaultPlaylist: Track[] = [
    {
        name: 'いつかこの恋を思い出してきっと泣いてしまう',
        artist_name: '得田真裕',
        audio: getMusicUrl('得田真裕 - いつかこの恋を思い出してきっと泣いてしまう.flac'),
    },
];

export interface MusicState {
    playlist: Track[];
    currentIndex: number;
    isPlaying: boolean;
    isVisible: boolean; // Controls the UI panel visibility
    currentTime: number;
    duration: number;
    seekTime: number | null; // Set this to trigger a seek
}

let state: MusicState = {
    playlist: defaultPlaylist,
    currentIndex: 0,
    isPlaying: false,
    isVisible: false,
    currentTime: 0,
    duration: 0,
    seekTime: null,
};

const LISTENERS = new Set<(state: MusicState) => void>();

function notify() {
    LISTENERS.forEach(listener => listener(state));
}

export const musicStore = {
    getState: () => state,
    subscribe: (listener: (state: MusicState) => void) => {
        LISTENERS.add(listener);
        return () => { LISTENERS.delete(listener); };
    },
    
    // Actions
    play: () => {
        state = { ...state, isPlaying: true };
        notify();
    },
    pause: () => {
        state = { ...state, isPlaying: false };
        notify();
    },
    togglePlay: () => {
        state = { ...state, isPlaying: !state.isPlaying };
        notify();
    },
    nextTrack: () => {
        if (state.playlist.length === 0) return;
        state = { ...state, currentIndex: (state.currentIndex + 1) % state.playlist.length };
        notify();
    },
    prevTrack: () => {
        if (state.playlist.length === 0) return;
        state = { 
            ...state, 
            currentIndex: state.currentIndex === 0 ? state.playlist.length - 1 : state.currentIndex - 1 
        };
        notify();
    },
    setPlaylist: (playlist: Track[]) => {
        state = { ...state, playlist, currentIndex: 0 };
        notify();
    },
    toggleVisibility: () => {
        state = { ...state, isVisible: !state.isVisible };
        notify();
    },
    setVisibility: (isVisible: boolean) => {
        state = { ...state, isVisible };
        notify();
    },
    // We need a way to set the playing state from the actual audio element
    // so if it pauses (e.g. from error or ended), state updates correctly.
    syncIsPlaying: (isPlaying: boolean) => {
        if (state.isPlaying !== isPlaying) {
            state = { ...state, isPlaying };
            notify();
        }
    },
    syncTime: (currentTime: number, duration: number) => {
        state = { ...state, currentTime, duration };
        notify();
    },
    seek: (time: number) => {
        state = { ...state, seekTime: time, currentTime: time };
        notify();
    },
    clearSeek: () => {
        if (state.seekTime !== null) {
            state = { ...state, seekTime: null };
            notify();
        }
    }
};

// Custom Hook for React Components
import { useEffect, useState } from 'react';

export function useMusicStore() {
    const [localState, setLocalState] = useState<MusicState>(musicStore.getState());

    useEffect(() => {
        return musicStore.subscribe(setLocalState);
    }, []);

    return localState;
}
