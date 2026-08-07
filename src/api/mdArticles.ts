import { useEffect, useState } from 'react';
import GithubSlugger from 'github-slugger';
import { API_BASE } from './config';
import type { Article } from './articles';

// 内容 API 地址：优先取 VITE_CONTENT_API_URL（内容 Worker 地址），
// 否则沿用 VITE_API_URL / 同源 /api（由部署环境决定）。
export const CONTENT_API_BASE = (import.meta.env.VITE_CONTENT_API_URL as string || API_BASE || '').replace(/\/+$/, '');

export const CONTENT_API_ENABLED = CONTENT_API_BASE.length > 0;

export interface ArticleIndex {
  updatedAt?: string;
  articles: Article[];
}

const HEADING_REGEX = /^(#{1,6})\s+(.+)$/gm;

export function parseHeadings(content: string): { depth: number; slug: string; text: string }[] {
  const headings: { depth: number; slug: string; text: string }[] = [];
  const slugger = new GithubSlugger();
  let match;
  while ((match = HEADING_REGEX.exec(content)) !== null) {
    headings.push({ depth: match[1].length, slug: slugger.slug(match[2]), text: match[2] });
  }
  return headings;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${CONTENT_API_BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

export function fetchArticleIndex(): Promise<ArticleIndex> {
  if (!CONTENT_API_ENABLED) return Promise.reject(new Error('VITE_CONTENT_API_URL 未配置'));
  return getJson<ArticleIndex>('/api/articles');
}

export async function getRemoteArticles(): Promise<Article[]> {
  const idx = await fetchArticleIndex();
  return Array.isArray(idx.articles) ? idx.articles : [];
}

export async function getRemoteArticle(id: string): Promise<Article> {
  if (!CONTENT_API_ENABLED) throw new Error('VITE_CONTENT_API_URL 未配置');
  return getJson<Article>(`/api/articles/${encodeURIComponent(id)}`);
}

export function useRemoteArticles(): Article[] {
  const [articles, setArticles] = useState<Article[]>([]);
  useEffect(() => {
    let cancelled = false;
    getRemoteArticles()
      .then((list) => { if (!cancelled) setArticles(list); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return articles;
}
