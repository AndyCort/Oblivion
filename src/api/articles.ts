import type { ComponentType } from 'react'
import { getRemoteArticles, getRemoteArticle } from './mdArticles'

export interface Article {
    id: string
    title: { [key: string]: string } | string
    summary?: { [key: string]: string } | string
    content?: { [key: string]: string } | string
    Content?: ComponentType
    headings?: { depth: number; slug: string; text: string }[]
    date: string
    author?: string
    cover?: string
    featuredImage?: string
    tags?: string[]
    pinned?: boolean
    path?: string
    chars?: number
}

/** 文章统一从内容 Worker（D1 数据库）加载。 */
export function fetchArticles(signal?: AbortSignal): Promise<Article[]> {
    return getRemoteArticles(signal)
}

export function fetchArticle(id: string, signal?: AbortSignal): Promise<Article> {
    return getRemoteArticle(id, signal)
}
