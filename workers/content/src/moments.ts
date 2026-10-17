import { isRecord } from './validation';

function parseField(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return value; }
}

function publicUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

/** Adapt the existing oblivion-moments articles table without changing its schema. */
export function rowToMoment(row: Record<string, unknown>) {
  const time = Number(row.time);
  const date = new Date(time < 1e12 ? time * 1000 : time);
  if (!Number.isFinite(time) || Number.isNaN(date.getTime())) {
    throw new Error('Invalid moment timestamp');
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const part = (name: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === name)?.value;
  const rawMedia = parseField(row.media);
  const media = (Array.isArray(rawMedia) ? rawMedia : []).flatMap((item: unknown) => {
    if (!isRecord(item)) return [];
    const url = publicUrl(item.url);
    if (!url || !['img', 'vid'].includes(String(item.type))) return [];
    return [{ type: item.type === 'vid' ? 'video' as const : 'image' as const, url }];
  });
  const tags = parseField(row.tags);
  const rawMusic = parseField(row.music);
  const musicUrl = isRecord(rawMusic) ? publicUrl(rawMusic.url) : null;
  const music = isRecord(rawMusic) && musicUrl ? {
    title: typeof rawMusic.title === 'string' ? rawMusic.title : '',
    artist: typeof rawMusic.artist === 'string' ? rawMusic.artist : '',
    url: musicUrl,
  } : null;

  return {
    id: `moment-${row.time}`,
    date: `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')}`,
    content: typeof row.content === 'string' ? row.content : '',
    location: typeof row.location === 'string' ? row.location : '',
    mood: '',
    tags: Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : [],
    likes: 0,
    media,
    music,
  };
}

export async function listMoments(db: D1Database) {
  const { results } = await db.prepare(
    'SELECT time, content, media, tags, location, music FROM articles ORDER BY time DESC',
  ).all<Record<string, unknown>>();
  return results.map(rowToMoment);
}
