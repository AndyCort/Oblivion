import { type Article } from './articles';
import matter from 'gray-matter';

// Use Vite's glob import to load all Markdown files as raw strings
const mdFilesRaw = import.meta.glob('/src/content/posts/*.md', { eager: true, query: '?raw', import: 'default' });

export function getLocalMarkdownArticles(): Article[] {
  const articles: Article[] = [];

  for (const path in mdFilesRaw) {
    // Extract filename without extension as id
    let filename = path.split('/').pop()?.replace(/\.md$/, '') || Math.random().toString();
    try {
      filename = decodeURIComponent(filename);
    } catch(e) {}

    const rawContent = (mdFilesRaw[path] as string) || '';
    
    // Parse frontmatter and content using gray-matter
    const { data: frontmatter, content } = matter(rawContent);

    // Simple markdown headings parser for TOC (just extract h1-h6)
    const headings: { depth: number, slug: string, text: string }[] = [];
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        depth: match[1].length,
        slug: match[2].toLowerCase().replace(/[^\w]+/g, '-'),
        text: match[2]
      });
    }

    articles.push({
      id: filename,
      title: frontmatter.title || filename,
      summary: frontmatter.summary || '',
      date: frontmatter.date || new Date().toISOString().split('T')[0],
      tags: frontmatter.tags || [],
      cover: frontmatter.cover || '',
      content: content,
      headings: headings
    });
  }

  // Sort by date descending
  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
