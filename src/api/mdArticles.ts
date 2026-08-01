import { type Article } from './articles';
import { parse as parseYaml } from 'yaml';
import GithubSlugger from 'github-slugger';

// Use Vite's glob import to load all Markdown files as raw strings
const mdFilesRaw = import.meta.glob('/src/content/posts/*.md', { eager: true, query: '?raw', import: 'default' });

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

function getLocalized(field: unknown, fallback: string): string {
  if (field && typeof field === 'object') {
    const obj = field as Record<string, unknown>;
    return (typeof obj.zh === 'string' ? obj.zh : (typeof obj.en === 'string' ? obj.en : fallback)) as string;
  }
  return typeof field === 'string' ? field : fallback;
}

function buildArticle(path: string, raw: string): Article {
  let filename = path.split('/').pop()?.replace(/\.md$/, '') || path;
  try {
    filename = decodeURIComponent(filename);
  } catch {
    // keep raw filename if it contains malformed escape sequences
  }

  const { frontmatter, content } = parseFrontmatter(raw);
  const title = getLocalized(frontmatter.title, filename);
  const summary = getLocalized(frontmatter.summary, '');
  const author = (frontmatter.author as string) || '';
  const date = (frontmatter.date as string) || new Date().toISOString().split('T')[0];

  return {
    id: filename,
    title,
    summary,
    author,
    date,
    tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
    cover: (frontmatter.cover as string) || '',
    content,
    headings: parseHeadings(content),
    pinned: !!frontmatter.pinned || !!frontmatter.top,
  };
}

let cached: Article[] | null = null;

export function getLocalMarkdownArticles(): Article[] {
  if (cached) return cached;

  cached = Object.entries(mdFilesRaw)
    .map(([path, raw]) => buildArticle(path, raw as string))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return cached;
}
