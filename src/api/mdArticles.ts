import { useEffect, useState } from 'react';
import { type Article } from './articles';
import { parse as parseYaml } from 'yaml';
import GithubSlugger from 'github-slugger';

// 文章内容公开地址：绑定到 R2 bucket 的自定义域名（例如 https://cdn.inpa.in）
export const CONTENT_URL = (import.meta.env.VITE_CONTENT_URL as string || '').replace(/\/+$/, '');

export interface ArticleIndex {
  updatedAt?: string;
  articles: Article[];
}

export function encodeContentPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

const HEADING_REGEX = /^(#{1,6})\s+(.+)$/gm;
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

function parseFrontmatter(rawContent: string): { frontmatter: Record<string, unknown>; content: string } {
  const fmMatch = rawContent.match(FRONTMATTER_REGEX);
  if (!fmMatch) return { frontmatter: {}, content: rawContent };

  try {
    return { frontmatter: (parseYaml(fmMatch[1]) || {}) as Record<string, unknown>, content: fmMatch[2] };
  } catch (e) {
    console.error('Error parsing YAML frontmatter', e);
    return { frontmatter: {}, content: fmMatch[2] };
  }
}

function parseHeadings(content: string): { depth: number; slug: string; text: string }[] {
  const headings: { depth: number; slug: string; text: string }[] = [];
  const slugger = new GithubSlugger();
  let match;
  while ((match = HEADING_REGEX.exec(content)) !== null) {
    headings.push({ depth: match[1].length, slug: slugger.slug(match[2]), text: match[2] });
  }
  return headings;
}

/** Keep a frontmatter field like `{ zh, en }` intact so the UI can switch locale at runtime. */
function keepLocalized(field: unknown): Record<string, string> | null {
  if (field && typeof field === 'object') {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(field)) {
      if (typeof value === 'string' && value.trim()) out[key] = value;
    }
    return Object.keys(out).length > 0 ? out : null;
  }
  return null;
}

function asString(field: unknown, fallback: string): string {
  return typeof field === 'string' && field.trim() ? field : fallback;
}

export function buildArticle(path: string, raw: string): Article {
  let filename = path.split('/').pop()?.replace(/\.md$/, '') || path;
  try {
    filename = decodeURIComponent(filename);
  } catch {
    // keep raw filename if it contains malformed escape sequences
  }

  const { frontmatter, content: body } = parseFrontmatter(raw);
  const title = keepLocalized(frontmatter.title) ?? asString(frontmatter.title, filename);
  const summary = keepLocalized(frontmatter.summary) ?? asString(frontmatter.summary, '');
  const author = (frontmatter.author as string) || '';
  const date = (frontmatter.date as string) || new Date().toISOString().split('T')[0];
  // 正文默认取 Markdown body；若 frontmatter 提供了 content: { zh, en } 则优先使用
  const content = keepLocalized(frontmatter.content) ?? body;

  return {
    id: filename,
    title,
    summary,
    author,
    date,
    tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
    cover: (frontmatter.cover as string) || '',
    content,
    headings: parseHeadings(body),
    pinned: !!frontmatter.pinned || !!frontmatter.top,
  };
}

let indexPromise: Promise<ArticleIndex> | null = null;

export function fetchArticleIndex(): Promise<ArticleIndex> {
  if (!CONTENT_URL) return Promise.reject(new Error('VITE_CONTENT_URL 未配置'));
  if (!indexPromise) {
    indexPromise = fetch(`${CONTENT_URL}/index.json`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to fetch article index: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data?.articles)) throw new Error('index.json 格式不正确');
        return data as ArticleIndex;
      })
      .catch((err) => {
        indexPromise = null;
        throw err;
      });
  }
  return indexPromise;
}

export async function getRemoteArticles(): Promise<Article[]> {
  const idx = await fetchArticleIndex();
  return idx.articles;
}

export async function getRemoteArticle(id: string): Promise<Article> {
  const idx = await fetchArticleIndex();
  const decoded = decodeURIComponent(id);
  const meta = idx.articles.find((a) => a.id === decoded || encodeURIComponent(a.id) === id);
  if (!meta) throw new Error(`Article not found: ${decoded}`);
  if (!meta.path) throw new Error(`Article has no path: ${decoded}`);
  const res = await fetch(`${CONTENT_URL}/${encodeContentPath(meta.path)}`);
  if (!res.ok) throw new Error(`Failed to fetch article: ${res.status}`);
  return buildArticle(meta.path, await res.text());
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
