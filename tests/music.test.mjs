import test from 'node:test';
import assert from 'node:assert/strict';
import { typescriptUrl, moduleUrl } from './load-typescript.mjs';

const apiUrl = await typescriptUrl('../src/api/music.ts');
const { normalizePlaylist, playlistUrl, fetchMetingPlaylist } = await import(apiUrl);
const { createMusicStore } = await import(await typescriptUrl('../src/stores/musicStore.ts', {
  react: import.meta.resolve('react'),
  '../api/music': apiUrl,
  '../config/music': moduleUrl('export const musicConfig = {};'),
}));

const tracks = [
  { name: 'Rain', artist_name: 'A', audio: 'https://music.example/rain.mp3', cover: '' },
  { name: 'Echo', artist_name: 'B', audio: 'https://music.example/echo.mp3', cover: '' },
];
const flush = () => new Promise(resolve => setImmediate(resolve));

class FakeAudio extends EventTarget {
  src = '';
  currentTime = 0;
  duration = NaN;
  paused = true;
  ended = false;
  error = null;
  loads = 0;
  plays = 0;
  pending = [];
  play() {
    this.plays++;
    this.paused = false;
    return new Promise((resolve, reject) => this.pending.push({ resolve, reject }));
  }
  pause() { this.paused = true; this.emit('pause'); }
  load() {
    this.loads++;
    this.currentTime = 0;
    this.duration = NaN;
    this.error = null;
    this.ended = false;
  }
  removeAttribute(name) { if (name === 'src') this.src = ''; }
  emit(name) { this.dispatchEvent(new Event(name)); }
  start() { this.emit('playing'); this.pending.at(-1)?.resolve(); }
  tick(time) { this.currentTime = time; this.emit('timeupdate'); }
  metadata(duration = 120) { this.duration = duration; this.emit('loadedmetadata'); }
}

async function fixture(playlist = tracks) {
  const audio = new FakeAudio();
  let creations = 0;
  const store = createMusicStore(async () => playlist, () => { creations++; return audio; });
  store.initialize();
  await store.loadPlaylist();
  return { audio, store, creations: () => creations };
}

test('Meting normalizes both response formats and rejects invalid media URLs', () => {
  const result = normalizePlaylist([
    { title: ' Rain ', author: 'A', url: '/song/1', pic: '//img.example/1.jpg' },
    { name: 'Echo', artist: ['B', 'C', null], url: 'https://music.example/2', cover: '/cover/2' },
    { title: 'Unsafe', url: 'javascript:alert(1)' },
    { title: 'Unavailable', url: '' }, null,
  ], 'https://api.example/meting');
  assert.equal(result.length, 2);
  assert.equal(result[0].name, 'Rain');
  assert.equal(result[0].audio, 'https://api.example/song/1');
  assert.equal(result[0].cover, 'https://img.example/1.jpg');
  assert.equal(result[1].artist_name, 'B / C');
  assert.deepEqual(normalizePlaylist([], 'https://api.example'), []);
  assert.throws(() => normalizePlaylist({ error: 'unavailable' }, 'https://api.example'));
  const url = new URL(playlistUrl({ api: 'https://api.example/meting?custom=1', server: 'netease', playlistId: '12&34' }));
  assert.equal(url.searchParams.get('id'), '12&34');
  assert.equal(url.searchParams.get('custom'), '1');
  assert.equal(url.searchParams.get('type'), 'playlist');
});

test('Meting fetch reports HTTP/JSON failures and accepts an empty playlist', async (t) => {
  const config = { api: 'https://api.example/meting', server: 'netease', playlistId: '1' };
  const mock = t.mock.method(globalThis, 'fetch', async () => new Response('[]', { status: 503 }));
  await assert.rejects(fetchMetingPlaylist(config), /503/);
  mock.mock.mockImplementation(async () => new Response('not json'));
  await assert.rejects(fetchMetingPlaylist(config));
  mock.mock.mockImplementation(async () => new Response('[]'));
  assert.deepEqual(await fetchMetingPlaylist(config), []);
});

test('opening and closing the panel deduplicates playlist loading without autoplay', async () => {
  let calls = 0;
  let resolve;
  const audio = new FakeAudio();
  const store = createMusicStore(() => { calls++; return new Promise(r => { resolve = r; }); }, () => audio);
  store.initialize();
  store.setVisibility(true);
  const pending = store.loadPlaylist();
  store.setVisibility(false);
  store.setVisibility(true);
  await flush();
  assert.equal(calls, 1);
  resolve(tracks);
  await pending;
  assert.equal(store.getState().playlistStatus, 'ready');
  assert.equal(store.getState().hasPlayed, false);
  assert.equal(audio.plays, 0);
});

test('native playback drives state; hiding UI and resubscribing preserve the same audio', async () => {
  const { audio, store, creations } = await fixture();
  audio.metadata();
  store.play();
  assert.equal(store.getState().isPlaying, false);
  assert.equal(store.getState().isBuffering, true);
  audio.start();
  audio.tick(24);
  const unsubscribe = store.subscribe(() => {});
  store.setVisibility(false);
  unsubscribe();
  store.initialize();
  audio.tick(30);
  store.setVisibility(true);
  assert.equal(creations(), 1);
  assert.equal(audio.loads, 1);
  assert.equal(audio.plays, 1);
  assert.equal(store.getState().currentTime, 30);
  assert.equal(store.getState().isPlaying, true);
  store.pause();
  audio.tick(31);
  assert.equal(store.getState().currentTime, 30);
  assert.equal(store.getState().hasPlayed, true);
  store.play();
  audio.start();
  audio.tick(32);
  assert.equal(store.getState().currentTime, 32);
});

test('changing tracks clears progress, preserves pause, and ignores stale play failures', async () => {
  const { audio, store } = await fixture();
  audio.metadata();
  store.play();
  const firstPlay = audio.pending[0];
  store.nextTrack();
  assert.equal(store.getState().currentIndex, 1);
  assert.equal(store.getState().currentTime, 0);
  assert.equal(store.getState().duration, 0);
  assert.equal(store.getState().hasPlayed, false);
  firstPlay.reject(new Error('Interrupted by source change'));
  await flush();
  assert.equal(store.getState().playbackError, false);
  audio.start();
  audio.metadata();
  audio.tick(60);
  store.pause();
  store.prevTrack();
  assert.equal(store.getState().currentIndex, 0);
  assert.equal(store.getState().isPlaying, false);
  assert.equal(store.getState().currentTime, 0);
  assert.equal(audio.plays, 2);
  store.selectTrack(1);
  assert.equal(audio.plays, 3);
});

test('ended wraps the playlist and restarts a single-track playlist', async () => {
  for (const playlist of [tracks, [tracks[0]]]) {
    const { audio, store } = await fixture(playlist);
    store.selectTrack(playlist.length - 1);
    audio.start();
    audio.ended = true;
    audio.paused = true;
    audio.emit('ended');
    assert.equal(store.getState().currentIndex, 0);
    assert.equal(store.getState().currentTime, 0);
    assert.equal(audio.plays, 2);
    assert.equal(store.getState().hasPlayed, false);
  }
});

test('seek clamps input, handles unknown duration, and keeps paused playback paused', async () => {
  const { audio, store } = await fixture();
  audio.metadata(Infinity);
  store.seek(10);
  assert.equal(store.getState().currentTime, 0);
  audio.metadata(120);
  store.seek(999);
  assert.equal(audio.currentTime, 120);
  store.seek(-20);
  assert.equal(audio.currentTime, 0);
  store.seek(NaN);
  assert.equal(audio.currentTime, 0);
  assert.equal(store.getState().isPlaying, false);
});

test('audio errors and autoplay rejection can be retried; dispose removes listeners', async () => {
  const { audio, store } = await fixture();
  store.play();
  audio.pending[0].reject(new Error('NotAllowedError'));
  await flush();
  assert.equal(store.getState().playbackError, true);
  assert.equal(store.getState().isBuffering, false);
  assert.equal(store.getState().hasPlayed, false);
  store.play();
  audio.start();
  audio.error = { code: 4 };
  audio.emit('error');
  assert.equal(store.getState().isPlaying, false);
  assert.equal(store.getState().playbackError, true);
  store.play();
  audio.start();
  assert.equal(store.getState().playbackError, false);
  store.dispose();
  audio.emit('playing');
  audio.tick(42);
  assert.equal(store.getState().isPlaying, false);
  assert.equal(store.getState().currentTime, 0);
  assert.equal(audio.src, '');
});

test('native pause cancels a pending play and seeking to the end while paused never autoplays', async () => {
  const { audio, store } = await fixture();
  store.play();
  audio.pause();
  audio.pending[0].reject(new Error('Interrupted by native pause'));
  await flush();
  assert.equal(store.getState().isPlaying, false);
  assert.equal(store.getState().playbackError, false);
  audio.metadata();
  store.seek(120);
  audio.ended = true;
  audio.emit('ended');
  assert.equal(store.getState().currentIndex, 0);
  assert.equal(audio.plays, 1);
});

test('playlist errors and empty responses can be retried without creating a play intent', async () => {
  let calls = 0;
  const store = createMusicStore(async () => {
    calls++;
    if (calls === 1) throw new Error('Network error');
    return calls === 2 ? [] : tracks;
  });
  await store.loadPlaylist();
  assert.equal(store.getState().playlistStatus, 'error');
  await store.loadPlaylist();
  assert.equal(store.getState().playlistStatus, 'ready');
  assert.deepEqual(store.getState().playlist, []);
  await store.loadPlaylist();
  assert.equal(store.getState().playlist.length, 2);
  assert.equal(store.getState().isPlaying, false);
});
