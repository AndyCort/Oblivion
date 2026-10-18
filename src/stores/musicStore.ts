import { useSyncExternalStore } from 'react';
import { fetchMetingPlaylist, type Track } from '../api/music';
import { musicConfig } from '../config/music';

export type { Track } from '../api/music';

export type PlayMode = 'list-loop' | 'single-loop' | 'shuffle';

export interface MusicState {
  playlist: Track[];
  currentIndex: number;
  isPlaying: boolean;
  isBuffering: boolean;
  hasPlayed: boolean;
  isVisible: boolean;
  currentTime: number;
  duration: number;
  playlistStatus: 'idle' | 'loading' | 'ready' | 'error';
  playbackError: boolean;
  playMode: PlayMode;
}

export function createMusicStore(
  loadTracks: () => Promise<Track[]> = () => fetchMetingPlaylist(musicConfig),
  createAudio: () => HTMLAudioElement = () => new Audio(),
) {
  let state: MusicState = {
    playlist: [], currentIndex: 0, isPlaying: false, isBuffering: false,
    hasPlayed: false, isVisible: false, currentTime: 0, duration: 0,
    playlistStatus: 'idle', playbackError: false, playMode: 'list-loop',
  };
  const listeners = new Set<() => void>();
  let audio: HTMLAudioElement | null = null;
  let removeAudioListeners: (() => void) | undefined;
  let loading: Promise<void> | null = null;
  let wantsPlayback = false;
  let playRequest = 0;

  function update(patch: Partial<MusicState>) {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  }

  function failPlayback() {
    wantsPlayback = false;
    update({ isPlaying: false, isBuffering: false, playbackError: true });
  }

  function initialize() {
    if (audio) return;
    const element = createAudio();
    audio = element;
    element.preload = 'metadata';
    const duration = () => Number.isFinite(element.duration) ? Math.max(0, element.duration) : 0;
    const events: Partial<Record<keyof HTMLMediaElementEventMap, () => void>> = {
      playing: () => {
        if (!wantsPlayback) { element.pause(); return; }
        update({ isPlaying: true, isBuffering: false, hasPlayed: true, playbackError: false });
      },
      pause: () => {
        // A source change can queue a pause event after the next play() call.
        if (!element.paused || element.ended) return;
        ++playRequest;
        wantsPlayback = false;
        update({ isPlaying: false, isBuffering: false });
      },
      waiting: () => { if (wantsPlayback) update({ isBuffering: true }); },
      timeupdate: () => {
        if (!element.paused && state.hasPlayed) {
          update({ currentTime: element.currentTime, duration: duration() });
        }
      },
      loadedmetadata: () => update({ duration: duration() }),
      durationchange: () => update({ duration: duration() }),
      ended: () => {
        if (!element.ended || !wantsPlayback) return;
        if (state.playMode === 'single-loop') {
          element.currentTime = 0;
          void element.play();
        } else if (state.playMode === 'shuffle') {
          changeTrack(getNextShuffleIndex(), true);
        } else {
          changeTrack(state.currentIndex + 1, true);
        }
      },
      error: () => { if (element.error) { ++playRequest; failPlayback(); } },
    };
    for (const [event, handler] of Object.entries(events)) element.addEventListener(event, handler);
    removeAudioListeners = () => {
      for (const [event, handler] of Object.entries(events)) element.removeEventListener(event, handler);
    };
    const track = state.playlist[state.currentIndex];
    if (track) element.src = track.audio;
  }

  function getNextShuffleIndex() {
    const length = state.playlist.length;
    if (length <= 1) return 0;
    let next = Math.floor(Math.random() * (length - 1));
    if (next >= state.currentIndex) next++;
    return next;
  }

  function play() {
    if (!state.playlist.length) return;
    initialize();
    const element = audio!;
    const request = ++playRequest;
    wantsPlayback = true;
    if (element.error) element.load();
    update({ isBuffering: true, playbackError: false });
    // Called synchronously from the user's click, preserving browser activation.
    void element.play().catch(() => {
      if (request === playRequest && audio === element) failPlayback();
    });
  }

  function pause() {
    ++playRequest;
    wantsPlayback = false;
    audio?.pause();
    update({ isPlaying: false, isBuffering: false });
  }

  function changeTrack(index: number, autoplay = wantsPlayback) {
    const length = state.playlist.length;
    if (!length) return;
    ++playRequest;
    wantsPlayback = false;
    audio?.pause();
    const currentIndex = ((index % length) + length) % length;
    update({ currentIndex, currentTime: 0, duration: 0, hasPlayed: false,
      isPlaying: false, isBuffering: false, playbackError: false });
    if (audio) {
      audio.src = state.playlist[currentIndex].audio;
      audio.load();
    }
    if (autoplay) play();
  }

  function loadPlaylist() {
    if (loading) return loading;
    if (state.playlistStatus === 'ready' && state.playlist.length) return Promise.resolve();
    update({ playlistStatus: 'loading' });
    loading = Promise.resolve().then(loadTracks).then((playlist) => {
      update({ playlist, playlistStatus: 'ready' });
      changeTrack(0, false);
    }).catch(() => {
      update({ playlistStatus: 'error' });
    }).finally(() => { loading = null; });
    return loading;
  }

  function setVisibility(isVisible: boolean) {
    update({ isVisible });
    if (isVisible && state.playlistStatus === 'idle') void loadPlaylist();
  }

  return {
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    initialize,
    dispose: () => {
      ++playRequest;
      wantsPlayback = false;
      removeAudioListeners?.();
      removeAudioListeners = undefined;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        audio = null;
      }
      update({ isPlaying: false, isBuffering: false, hasPlayed: false, currentTime: 0, duration: 0 });
    },
    loadPlaylist,
    play,
    pause,
    togglePlay: () => { if (wantsPlayback) pause(); else play(); },
    nextTrack: () => {
      if (state.playMode === 'shuffle') {
        changeTrack(getNextShuffleIndex());
      } else {
        changeTrack(state.currentIndex + 1);
      }
    },
    prevTrack: () => {
      if (state.playMode === 'shuffle') {
        changeTrack(getNextShuffleIndex());
      } else {
        changeTrack(state.currentIndex - 1);
      }
    },
    cyclePlayMode: () => {
      const modes: PlayMode[] = ['list-loop', 'single-loop', 'shuffle'];
      const nextMode = modes[(modes.indexOf(state.playMode) + 1) % modes.length];
      update({ playMode: nextMode });
    },
    setPlayMode: (playMode: PlayMode) => update({ playMode }),
    selectTrack: (index: number) => {
      if (!Number.isInteger(index) || index < 0 || index >= state.playlist.length) return;
      if (index === state.currentIndex) { if (!wantsPlayback) play(); }
      else changeTrack(index, true);
    },
    seek: (time: number) => {
      if (!audio || !Number.isFinite(time) || state.duration <= 0) return;
      const currentTime = Math.max(0, Math.min(time, state.duration));
      audio.currentTime = currentTime;
      update({ currentTime });
    },
    setVisibility,
    toggleVisibility: () => setVisibility(!state.isVisible),
  };
}

export const musicStore = createMusicStore();

export function useMusicStore() {
  return useSyncExternalStore(musicStore.subscribe, musicStore.getState, musicStore.getState);
}
