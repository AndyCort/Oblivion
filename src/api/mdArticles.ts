import { type Article } from './articles'

// Vite's glob import to load all Markdown files in src/content/posts
const mdFiles = import.meta.glob('/src/content/posts/*.md', { eager: true })

export function getLocalMarkdownArticles(): Article[] {
  const articles: Article[] = []

  for (const path in mdFiles) {
    const file: any = mdFiles[path]
    const frontmatter = file.frontmatter || {}
    
    // Extract filename without extension as id
    const filename = path.split('/').pop()?.replace(/\.md$/, '') || Math.random().toString()

    let rawContent = file.compiledContent ? file.compiledContent() : (file.default || file.rawContent || '')
    if (typeof file === 'string') rawContent = file

    articles.push({
      id: filename,
      title: frontmatter.title || filename,
      summary: frontmatter.summary || '',
      date: frontmatter.date || new Date().toISOString().split('T')[0],
      tags: frontmatter.tags || [],
      cover: frontmatter.cover || '',
      content: rawContent
    })
  }

  // Sort by date descending
  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
