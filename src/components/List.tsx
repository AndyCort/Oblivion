import { useState, useEffect, useMemo, useCallback } from 'react'
import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useTranslation } from '../i18n/useTranslation'
import { fetchArticles, type Article } from '../api/articles'
import defaultCover from '../assets/home.jpg?url'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

// ... (skipping styled components for brevity in thought, but tool needs exact match? No, I can target specific lines)
// wait, I can't skip content in TargetContent.
// I'll target the imports and then the component start.

// Actually, I'll allow multiple replacements in List.tsx via multi_replace or sequential replaces.
// I'll use separate tool calls for safety.

const spin = keyframes`
  to { transform: rotate(360deg); }
`



const ArticleListWrapper = styled.div`
  padding: 20px;
  width: clamp(800px, 80%, 1200px);
  margin: 0 auto;

  @media (max-width: 768px) { width: 100%; padding: 12px; }
  @media (max-width: 480px) { padding: 8px; }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 20px;
  color: var(--text-color);
`

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--glass-border-color);
  border-top-color: var(--text-color);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  color: var(--text-color);
  opacity: 0.6;
  i { font-size: 48px; }
  p { font-size: 16px; }
`

const Grid = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) { gap: 20px; }
`

const Card = styled(motion.article)`
  display: flex;
  flex-direction: row;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  width: 100%;
  background: var(--glass-bg-color);
  border: 1px solid var(--glass-border-color);
  box-shadow: var(--glass-box-shadow);

  &:hover {
    border-color: var(--main-color);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12); /* enhanced hover shadow */
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 10;
  }

  &:hover::before {
    opacity: 1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }

  &:hover .article-cover-img { transform: scale(1.1); }
  &:hover .read-more { color: var(--main-color); opacity: 1; }
  &:hover .read-more i { transform: translateX(6px); }
`

const Cover = styled.div`
  width: 320px;
  height: 220px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`

const CoverImage = styled.div<{ src: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`

const MetaOverlay = styled.div`
  border-radius: 6px;
  margin: 30px;
  padding: 6px;
  color: var(--text-color);
  background-color: var(--glass-bg-color);
  position: absolute;
  top: 0;

  &.left { left: 0; }
  &.right { right: 0; }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 4px 8px;
    margin: 8px;
  }
`

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  i { font-size: 12px; }
`

const Content = styled.div`
  padding: 24px 30px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  min-width: 0;

  @media (max-width: 768px) { padding: 20px; gap: 12px; }
`

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.4;
  margin: 0;
  transition: color 0.3s ease;

  ${Card}:hover & {
    color: var(--main-color);
  }

  @media (max-width: 768px) { font-size: 1.25rem; }
`

const Summary = styled.p`
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) { font-size: 0.85rem; -webkit-line-clamp: 2; line-clamp: 2; }
  @media (max-width: 480px) { font-size: 0.8rem; }
`

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
  @media (max-width: 768px) { gap: 6px; }
`

const Tag = styled.span`
  padding: 4px 12px;
  font-size: 0.75rem;
  background: var(--main-color);
  color: var(--theme-color);
  border-radius: 12px;
  opacity: 0.85;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.05);
  }
`



const ReadMore = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
  transition: all 0.2s;
  i { font-size: 12px; transition: transform 0.2s; }
  @media (max-width: 768px) { font-size: 0.85rem; }
`


const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding: 20px 0;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 24px;
    padding: 16px 0;
  }
`

const PaginationBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid var(--glass-border-color);
  border-radius: 8px;
  background: var(--glass-bg-color);
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  i { font-size: 12px; }

  &:hover:not(:disabled) {
    background: var(--main-color);
    transform: translateY(-2px);
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.8rem;
    span { display: none; }
  }
`

const PaginationNumbers = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    order: -1;
    width: 100%;
    justify-content: center;
    gap: 6px;
  }
`

const PaginationNum = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--glass-border-color);
  border-radius: 8px;
  background: var(--glass-bg-color);
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled):not(.active) { background: var(--main-color); }
  &.active { color: var(--main-color); border-color: var(--main-color); font-weight: 600; }
  &.ellipsis { cursor: default; background: transparent; border: none; }

  @media (max-width: 768px) { width: 32px; height: 32px; font-size: 0.8rem; }
  @media (max-width: 480px) { width: 28px; height: 28px; font-size: 0.75rem; }
`

function MathTiltCard({ article, onClick, locale, index }: { article: Article, onClick: () => void, locale: string, index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-200, 200], [8, -8]);
  const rotateY = useTransform(x, [-200, 200], [-8, 8]);

  function handleMouseMove(event: MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const getArticleCover = () => article.cover || article.featuredImage || defaultCover;

  const getLocalizedField = (field: any) => {
    if (!field) return ''
    if (typeof field === 'string') return field
    const lang = locale === 'zh-CN' ? 'zh' : 'en'
    return field[lang] || field.zh || field.en || Object.values(field)[0]
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  const getReadingTime = () => {
    const textLength = getLocalizedField(article.summary)?.length || 500;
    const time = Math.max(1, Math.ceil(textLength / 250));
    return locale === 'zh-CN' ? `${time} 分钟阅读` : `${time} min read`;
  }

  return (
    <motion.div
      style={{ perspective: 2000 }}
      variants={itemVariants}
      custom={index}
    >
      <Card
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.02, zIndex: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <Cover className="article-cover" style={{ transform: "translateZ(40px)" }}>
          <CoverImage className="article-cover-img" src={getArticleCover()} />
          <MetaOverlay className="left">
            <MetaItem><i className="far fa-calendar"></i>{formatDate(article.date)}</MetaItem>
          </MetaOverlay>
          <MetaOverlay className="right">
            <MetaItem><i className="far fa-clock"></i>{getReadingTime()}</MetaItem>
          </MetaOverlay>
        </Cover>
        <Content style={{ transform: "translateZ(20px)" }}>
          <Title>{getLocalizedField(article.title)}</Title>
          <Summary>{getLocalizedField(article.summary)}</Summary>
          {article.tags && article.tags.length > 0 && (
            <Tags>{article.tags.slice(0, 5).map((tag) => <Tag key={tag}>{tag}</Tag>)}</Tags>
          )}
          <ReadMore className="read-more">
            {locale === 'zh-CN' ? '阅读更多' : 'Read More'}
            <i className="fas fa-arrow-right"></i>
          </ReadMore>
        </Content>
      </Card>
    </motion.div>
  );
}

export default function List() {
  const navigate = useNavigate()
  const { t, locale } = useTranslation()

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  const filteredArticles = articles

  const totalPages = useMemo(() => Math.ceil(filteredArticles.length / pageSize), [filteredArticles.length])

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredArticles.slice(start, start + pageSize)
  }, [filteredArticles, currentPage])

  const visiblePages = useMemo(() => {
    const pages = []
    const total = totalPages
    const current = currentPage
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
    return pages
  }, [totalPages, currentPage])

  const goToArticle = (id: string) => navigate(`/articles/${id}`)

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    const el = document.querySelector('.article-list')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }



  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          const data = await fetchArticles()
          if (!cancelled) setArticles(data)
        } catch (err) {
          console.error('Failed to load articles:', err)
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <ArticleListWrapper className="article-list">
        {loading ? (
          <LoadingContainer>
            <Spinner />
            <span>{t('articles.loading') || '加载中...'}</span>
          </LoadingContainer>
        ) : articles.length === 0 ? (
          <EmptyState>
            <i className="far fa-folder-open"></i>
            <p>{t('articles.noArticles')}</p>
          </EmptyState>
        ) : (
          <>
            {filteredArticles.length === 0 ? (
              <EmptyState>
                <i className="far fa-folder-open"></i>
                <p>{t('articles.noArticles')}</p>
              </EmptyState>
            ) : (
              <>
                <Grid
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {paginatedArticles.map((article, idx) => (
                    <MathTiltCard
                      key={article.id}
                      article={article}
                      onClick={() => goToArticle(article.id)}
                      locale={locale}
                      index={idx}
                    />
                  ))}
                </Grid>

                {totalPages > 1 && (
                  <Pagination>
                    <PaginationBtn disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>
                      <i className="fas fa-chevron-left"></i><span>{t('articles.prev') || '上一页'}</span>
                    </PaginationBtn>
                    <PaginationNumbers>
                      {visiblePages.map((page, i) => (
                        <PaginationNum
                          key={i}
                          className={`${page === currentPage ? 'active' : ''}${page === '...' ? ' ellipsis' : ''}`}
                          disabled={page === '...'}
                          onClick={() => page !== '...' && goToPage(page as number)}
                        >
                          {page}
                        </PaginationNum>
                      ))}
                    </PaginationNumbers>
                    <PaginationBtn disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>
                      <span>{t('articles.next') || '下一页'}</span><i className="fas fa-chevron-right"></i>
                    </PaginationBtn>
                  </Pagination>
                )}
              </>
            )}
          </>
        )}
      </ArticleListWrapper>
    </>
  )
}
