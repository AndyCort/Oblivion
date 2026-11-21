export interface Track {
  name: string;
  artist_name: string;
  audio: string;
  cover: string;
}

export interface MetingConfig {
  api: string;
  server: string;
  playlistId: string;
}

export type ParsedMomentMusicUrl =
  | { kind: 'audio'; url: string }
  | { kind: 'meting'; server: string; id: string }
  | { kind: 'external'; url: string };

const AUDIO_EXT_RE = /\.(mp3|m4a|aac|ogg|opus|wav|flac|webm)$/i;
const resolvedSongCache = new Map<string, Track | null>();

function mediaUrl(value: unknown, baseUrl: string): string {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value, baseUrl);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

// Meting v1 returns name/artist, while v2 returns title/author.
export function normalizePlaylist(data: unknown, baseUrl: string): Track[] {
  if (!Array.isArray(data)) throw new Error('Invalid Meting playlist');
  return data.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const song = item as Record<string, unknown>;
    const audio = mediaUrl(song.url, baseUrl);
    if (!audio) return [];
    const name = song.name ?? song.title;
    const artist = song.artist ?? song.author;
    return [{
      name: typeof name === 'string' ? name.trim() : '',
      artist_name: Array.isArray(artist)
        ? artist.filter((value) => typeof value === 'string').join(' / ')
        : typeof artist === 'string' ? artist.trim() : '',
      audio,
      cover: mediaUrl(song.pic ?? song.cover, baseUrl),
    }];
  });
}

export function playlistUrl(config: MetingConfig): string {
  const url = new URL(config.api);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid Meting API URL');
  url.searchParams.set('server', config.server);
  url.searchParams.set('type', 'playlist');
  url.searchParams.set('id', config.playlistId);
  return url.href;
}

export async function fetchMetingPlaylist(config: MetingConfig): Promise<Track[]> {
  const url = playlistUrl(config);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Meting returned ${response.status}`);
    return normalizePlaylist(await response.json(), response.url || url);
  } finally {
    clearTimeout(timeout);
  }
}

function extractHashParams(hash: string): URLSearchParams {
  const queryIndex = hash.indexOf('?');
  return new URLSearchParams(queryIndex >= 0 ? hash.slice(queryIndex + 1) : '');
}

export function parseMomentMusicUrl(rawUrl: string): ParsedMomentMusicUrl {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return { kind: 'external', url: rawUrl };
  }
  if (!['https:', 'http:'].includes(url.protocol)) {
    return { kind: 'external', url: rawUrl };
  }

  const host = url.hostname.toLowerCase();
  if (host === 'music.163.com' || host.endsWith('.music.163.com')) {
    const hashParams = extractHashParams(url.hash);
    const id = url.searchParams.get('id') || hashParams.get('id') || url.pathname.match(/\/song\/(\d+)/)?.[1];
    if (id && /^\d+$/.test(id)) {
      return { kind: 'meting', server: 'netease', id };
    }
  }

  if (host === 'y.qq.com') {
    const id = url.searchParams.get('songmid') || url.pathname.match(/\/songDetail\/([a-zA-Z0-9]+)/)?.[1];
    if (id) {
      return { kind: 'meting', server: 'tencent', id };
    }
  }

  if (AUDIO_EXT_RE.test(url.pathname) || url.searchParams.get('type') === 'url') {
    return { kind: 'audio', url: url.href };
  }

  return { kind: 'external', url: url.href };
}

export async function fetchMetingSong(
  config: MetingConfig,
  id: string,
  server = config.server,
): Promise<Track | null> {
  const cacheKey = `${server}:${id}`;
  if (resolvedSongCache.has(cacheKey)) {
    return resolvedSongCache.get(cacheKey) ?? null;
  }

  const endpoint = new URL(config.api);
  if (!['https:', 'http:'].includes(endpoint.protocol)) return null;
  endpoint.searchParams.set('server', server);
  endpoint.searchParams.set('type', 'song');
  endpoint.searchParams.set('id', id);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(endpoint.href, { signal: controller.signal });
    if (!response.ok) return null;
    const tracks = normalizePlaylist(await response.json(), response.url || endpoint.href);
    const track = tracks[0] ?? null;
    resolvedSongCache.set(cacheKey, track);
    return track;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function resolveMomentTrack(
  music: { title: string; artist: string; url: string },
  config: MetingConfig,
): Promise<Track | null> {
  const parsed = parseMomentMusicUrl(music.url);
  if (parsed.kind === 'audio') {
    return {
      name: music.title,
      artist_name: music.artist,
      audio: parsed.url,
      cover: '',
    };
  }
  if (parsed.kind === 'meting') {
    const resolved = await fetchMetingSong(config, parsed.id, parsed.server);
    if (!resolved) return null;
    return {
      ...resolved,
      name: resolved.name || music.title,
      artist_name: resolved.artist_name || music.artist,
    };
  }
  return null;
}
