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

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: {
      zh: '探索 Astro 5 与 React 19 的极致前端体验',
      en: 'Exploring Ultimate Frontend Performance with Astro 5 & React 19'
    },
    summary: {
      zh: '本文深度剖析现代 Web 架构中静态生成与岛屿架构（Islands Architecture）的结合，探讨如何打造零 JS 负担的现代轻量级博客站点。',
      en: 'An in-depth analysis of SSG and Islands Architecture in modern Web design, exploring how to build ultra-fast blogs.'
    },
    date: '2026-07-20',
    tags: ['Astro', 'React', 'Frontend', 'Web Performance'],
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: {
      zh: 'Cloudflare Pages 全球自动化无缝部署全攻略',
      en: 'Complete Guide to Cloudflare Pages Global CI/CD Deployment'
    },
    summary: {
      zh: '从 GitHub 仓库自动绑定到自定义 Edge 域名路由，学习如何零成本构建分布于全球 300+ 节点的高可用静态及全栈应用。',
      en: 'Learn how to deploy zero-cost high-availability applications across 300+ global edge locations using Cloudflare Pages.'
    },
    date: '2026-07-22',
    tags: ['Cloudflare', 'DevOps', 'CI/CD', 'Web Hosting'],
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: {
      zh: 'Building Futuristic User Interfaces with Styled Components & Framer Motion',
      en: 'Building Futuristic User Interfaces with Styled Components & Framer Motion'
    },
    summary: {
      zh: '掌握流畅微交互与 CSS 变量的动态控制，利用现代动画库和数学视角下的 3D 倾斜卡片组件打造令人眼前一亮的科技风视觉效果。',
      en: 'Master micro-interactions and dynamic CSS variables to build eye-catching tech-inspired UI components with smooth animations.'
    },
    date: '2026-07-23',
    tags: ['UI/UX', 'Framer Motion', 'CSS', 'Design'],
    cover: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: {
      zh: '全栈开发者的国际化 (i18n) 最佳实践',
      en: 'Internationalization (i18n) Best Practices for Fullstack Developers'
    },
    summary: {
      zh: '在多语言 Web 项目中优雅处理语系切换、字体渲染与客户端状态同步，提供无缝的双语阅读体验。',
      en: 'Handling language switching, font rendering, and client state synchronization smoothly for bilingual users.'
    },
    date: '2026-07-24',
    tags: ['i18n', 'Architecture', 'TypeScript'],
    cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '5',
    title: {
      zh: 'Web 视觉美学：流体质感与粒子动画沉浸式体验',
      en: 'Web Visual Aesthetics: Fluid Textures & Particle Animations'
    },
    summary: {
      zh: '从色彩搭配到 Canvas / WebGL 粒子系统的融入，探索如何通过细腻的背景光影与微交互将一个普通网页转变为极具视觉震撼力的现代艺术品。',
      en: 'Explore how to elevate standard web interfaces into visually stunning modern digital art pieces with WebGL particles and fluid UI gradients.'
    },
    date: '2026-07-24',
    tags: ['Canvas', 'Animation', 'Creative Coding'],
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
  }
];

export async function fetchArticles(): Promise<Article[]> {
    try {
        const response = await fetch(`${API_BASE}/api/articles`)
        if (!response.ok) throw new Error('Failed to fetch articles')
        const data = await response.json()
        return (Array.isArray(data) && data.length > 0) ? data : MOCK_ARTICLES;
    } catch (err) {
        console.warn('API error, falling back to mock articles:', err);
        return MOCK_ARTICLES;
    }
}

export async function fetchArticle(id: string): Promise<Article> {
    try {
        const response = await fetch(`${API_BASE}/api/articles/${id}`)
        if (!response.ok) throw new Error('Failed to fetch article')
        return response.json()
    } catch (err) {
        console.warn('API error, searching in mock articles:', err)
        const found = MOCK_ARTICLES.find(a => a.id === id)
        return found || MOCK_ARTICLES[0]
    }
}

export async function searchArticles(query: string): Promise<Article[]> {
    const response = await fetch(`${API_BASE}/api/articles/search/${query}`)
    if (!response.ok) throw new Error('Failed to search articles')
    return response.json()
}
