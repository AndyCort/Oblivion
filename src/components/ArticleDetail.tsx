import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { marked } from 'marked'
import { fetchArticle, type Article } from '../api/articles'
import { useTranslation } from '../i18n/useTranslation'
import defaultCover from '../assets/home.jpg?url'

const DetailWrapper = styled(motion.div)`
  max-width: 900px;
  margin: 100px auto 60px;
  padding: 40px 30px;
  background: var(--glass-bg-color);
  border: 1px solid var(--glass-border-color);
  border-radius: 24px;
  box-shadow: var(--glass-box-shadow);
  color: var(--text-color);

  @media (max-width: 768px) {
    margin: 80px 16px 40px;
    padding: 24px 18px;
  }
`

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid var(--glass-border-color);
  color: var(--text-color);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--main-color);
    border-color: var(--main-color);
  }
`

const Title = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 16px;
  color: var(--title-color);
  line-height: 1.3;
`

const Meta = styled.div`
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 24px;
`

const Cover = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 30px;
`

const ArticleBody = styled.div`
  /*全局正文基础样式*/
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-color);
  /* Use normal whitespace since marked parses to proper HTML blocks */
  white-space: normal;

  /*段落与内联文本*/
  p {
    margin-bottom: 1.5em; /* 段落之间的间距 */
  }
  strong { font-weight: 700; color: var(--title-color); } /* 加粗 */
  em { font-style: italic; } /* 斜体 */
  del { opacity: 0.6; } /* 删除线 */

  /*标题样式*/
  h1, h2, h3, h4, h5, h6 {
    color: var(--title-color);
    margin-top: 2em; /* 标题上方留白 */
    margin-bottom: 1em; /* 标题下方留白 */
    font-weight: 700;
    line-height: 1.4;
  }
  h1 { font-size: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5em; }
  h2 { font-size: 1.5rem; border-bottom: 1px solid var(--glass-border-color); padding-bottom: 0.3em; }
  h3 { font-size: 1.25rem; }

  /*超链接*/
  a {
    color: var(--main-color);
    text-decoration: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.8; text-decoration: underline; }
  }

  /*引用块*/
  blockquote {
    margin: 1.5em 0;
    padding: 1em 1.5em;
    border-left: 4px solid var(--main-color); /* 左侧高亮边框 */
    background: rgba(150, 150, 150, 0.05); /* 半透明背景 */
    border-radius: 0 8px 8px 0;
    color: var(--title-color);
    font-style: italic;
    
    p:last-child { margin-bottom: 0; }
  }

  /*列表*/
  ul, ol {
    margin-bottom: 1.5em;
    padding-left: 1.5em; /* 缩进 */
    li { margin-bottom: 0.5em; } /* 列表项间距 */
  }

  /*媒体与分隔线*/
  img {
    max-width: 100%;
    height: auto;
    border-radius: 12px; /* 图片圆角 */
    margin: 1.5em 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* 图片阴影 */
  }
  hr {
    border: 0;
    height: 1px;
    background: var(--glass-border-color); /* 分隔线颜色 */
    margin: 3em 0;
  }

  /* =========================================
     8. 表格 (Tables)
     ========================================= */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2em 0;
    
    th, td {
      border: 1px solid var(--glass-border-color); /* 单元格边框 */
      padding: 12px 16px;
      text-align: left;
    }
    th {
      background: rgba(150, 150, 150, 0.05); /* 表头背景色 */
      font-weight: 600;
      color: var(--title-color);
    }
  }

  /* =========================================
     9. 代码展示 (Inline Code & Code Blocks)
     ========================================= */
  code { /* 行内代码块样式 */
    font-family: 'Fira Code', monospace, Consolas;
    background: rgba(150, 150, 150, 0.1); /* 浅色背景 */
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
    color: var(--title-color);
  }

  pre { /* 多行代码块容器样式 - macOS 风格 */
    background: #1e1e1e !important; /* 暗色主题背景 */
    padding: 3.5em 1.5em 1.5em; /* 顶部增加内边距给 macOS 按钮留出空间 */
    border-radius: 12px;
    overflow-x: auto; /* 超出横向滚动 */
    margin: 2em 0;
    border: 1px solid var(--glass-border-color);
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); /* 窗口阴影 */
    
    /* macOS 风格的三色按钮 */
    &::before {
      content: '';
      position: absolute;
      top: 16px;
      left: 16px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ff5f56; /* 红色关闭按钮 */
      box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f; /* 黄色最小化、绿色最大化按钮 */
    }

    code {
      background: transparent; /* 去除内层行内代码背景 */
      padding: 0;
      color: #d4d4d4; /* 暗色主题下的代码文本颜色 */
      font-size: 0.95em;
      line-height: 1.6;
    }
  }
`

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { locale } = useTranslation()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
      ; (async () => {
        try {
          const data = await fetchArticle(id)
          if (!cancelled) setArticle(data)
        } catch (err: any) {
          if (!cancelled) setErrorMsg(err.message || 'Unknown error')
          console.error(err)
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return <DetailWrapper>加载中...</DetailWrapper>
  }

  if (!article) {
    return (
      <DetailWrapper>
        <BackButton onClick={() => navigate('/')}>← 返回</BackButton>
        <h2>未找到文章</h2>
        <pre style={{ marginTop: '20px', color: 'red' }}>
          Debug Info:
          <br />
          Requested ID: {id}
          <br />
          Error: {errorMsg}
        </pre>
      </DetailWrapper>
    )
  }

  const getLocalized = (field: any) => {
    if (!field) return ''
    if (typeof field === 'string') return field
    return field[locale === 'zh-CN' ? 'zh' : 'en'] || field.zh || field.en || ''
  }

  const titleText = getLocalized(article.title)
  const summaryText = getLocalized(article.summary)
  let contentText = article.content ? getLocalized(article.content) : summaryText

  // Parse Markdown to HTML string
  try {
    contentText = marked.parse(contentText) as string
  } catch (e) {
    console.error('Markdown parse error', e)
  }

  return (
    <DetailWrapper initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <BackButton onClick={() => navigate('/')}>← {locale === 'zh-CN' ? '返回列表' : 'Back'}</BackButton>
      <Title>{titleText}</Title>
      <Meta>
        <span>📅 {article.date}</span>
        {article.tags && <span>🏷️ {article.tags.join(', ')}</span>}
      </Meta>
      {(article.cover || article.featuredImage) && (
        <Cover src={article.cover || article.featuredImage || defaultCover} alt={titleText} />
      )}
      <ArticleBody dangerouslySetInnerHTML={{ __html: contentText }} />
    </DetailWrapper>
  )
}
