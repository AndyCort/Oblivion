import { API_BASE } from './config'

export interface Article {
    id: string
    title: { [key: string]: string } | string
    summary?: { [key: string]: string } | string
    content?: { [key: string]: string } | string
    date: string
    author?: string
    cover?: string
    featuredImage?: string
    tags?: string[]
}

export async function fetchArticles(): Promise<Article[]> {
    const response = await fetch(`${API_BASE}/api/articles`)
    if (!response.ok) throw new Error('Failed to fetch articles')
    return response.json()
}

export async function fetchArticle(id: string): Promise<Article> {
    const response = await fetch(`${API_BASE}/api/articles/${id}`)
    if (!response.ok) throw new Error('Failed to fetch article')
    return response.json()
}

export async function searchArticles(query: string): Promise<Article[]> {
    const response = await fetch(`${API_BASE}/api/articles/search/${query}`)
    if (!response.ok) throw new Error('Failed to search articles')
    return response.json()
}
