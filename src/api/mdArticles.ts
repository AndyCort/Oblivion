import { type Article } from './articles'

// Vite's glob import to load all Markdown files in src/content/posts
const mdFiles = import.meta.glob('/src/content/posts/*.md', { eager: true })
const mdFilesRaw = import.meta.glob('/src/content/posts/*.md', { eager: true, query: '?raw', import: 'default' })

export function getLocalMarkdownArticles(): Article[] {
  const articles: Article[] = []

  for (const path in mdFiles) {
    const file: any = mdFiles[path]
    const frontmatter = file.frontmatter || {}
    
    // Extract filename without extension as id
    let filename = path.split('/').pop()?.replace(/\.md$/, '') || Math.random().toString()
    try {
      filename = decodeURIComponent(filename)
    } catch(e) {}

    // Get raw markdown string
    let rawContent = (mdFilesRaw[path] as string) || ''
    
    // Remove frontmatter from rawContent if it exists so we just show the body
    if (rawContent.startsWith('---')) {
      rawContent = rawContent.replace(/^---[\s\S]*?---\n*/, '')
    }

    console.log(`[mdArticles] Loaded article ${filename}, length: ${rawContent.length}`)

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
