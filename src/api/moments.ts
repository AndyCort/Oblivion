import { CONTENT_API_BASE } from './mdArticles';

export interface Moment {
  id: string;
  date: string;
  location: string;
  content: string;
  mood: string;
  tags: string[];
  /** The database has no like counter; likes are kept on this device. */
  likes: number;
  media: { type: 'image' | 'video'; url: string }[];
  music: { title: string; artist: string; url: string } | null;
}

export async function fetchMoments(signal?: AbortSignal): Promise<Moment[]> {
  const response = await fetch(`${CONTENT_API_BASE}/api/moments`, { signal });
  if (!response.ok) throw new Error(`Failed to fetch moments: ${response.status}`);
  const body = await response.json() as { moments?: unknown };
  if (!Array.isArray(body.moments)) throw new Error('Invalid moments response');
  return body.moments;
}
