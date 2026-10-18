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
