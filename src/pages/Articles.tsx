import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/layout/Background';
import SideButton from '../components/layout/SideButton';
import ArticleCard from '../components/articles/ArticleCard';

import { useArticles } from '../hooks/useArticles';
import { useLocale } from '../i18n/useLocale';
import Pagination from '../components/common/Pagination';
import { Newspaper, FolderOpen } from 'lucide-react';

export default function Articles() {
  const { locale } = useLocale();
  const { articles: mdArticles, loading } = useArticles();

  const articles = useMemo(() => {
    return mdArticles.map((a) => ({
      slug: a.id,
      title: a.title,
      summary: a.summary,
      author: a.author,
      date: a.date,
      tags: a.tags || [],
      cover: a.cover || a.featuredImage,
      pinned: a.pinned
    }));
  }, [mdArticles]);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const visibleArticles = articles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageTitle = locale === "zh-CN" ? "文章" : "Articles";
  const pageSubtitle = locale === "zh-CN"
    ? "探索技术、生活与思考的交汇点"
    : "Exploring the intersection of technology, life, and thoughts.";

  useEffect(() => {
    document.title = `${pageTitle} — Oblivion`;
  }, [pageTitle]);

  return (
    <MainLayout>
      <SideButton />
      <Background />

      <ArticlesPage>
        <ArticlesHeader>
          <HeaderContent>
            <PageTitle>{pageTitle}</PageTitle>
            <PageSubtitle>{pageSubtitle}</PageSubtitle>

            <StatsRow>
              <StatItem>
                <Newspaper size={18} />
                <strong>{articles.length}</strong>
                {locale === "zh-CN" ? "篇文章" : "Articles"}
              </StatItem>
            </StatsRow>
          </HeaderContent>
        </ArticlesHeader>

        <ArticlesSection>
          {loading ? (
            <p role="status">{locale === "zh-CN" ? "加载中…" : "Loading…"}</p>
          ) : articles.length > 0 ? (
            <ArticleGrid>
              {visibleArticles.map((article) => (
                <ArticleItemWrapper key={article.slug}>
                  <ArticleCard
                    title={article.title}
                    summary={article.summary}
                    author={article.author}
                    date={article.date}
                    tags={article.tags}
                    cover={article.cover}
                    slug={article.slug}
                    pinned={article.pinned}
                  />
                </ArticleItemWrapper>
              ))}
            </ArticleGrid>
          ) : (
            <EmptyState data-card="base">
              <div className="empty-icon"><FolderOpen size={48} /></div>
              <h3>{locale === "zh-CN" ? "暂无文章" : "No articles"}</h3>
            </EmptyState>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </ArticlesSection>
      </ArticlesPage>
    </MainLayout>
  );
}

// Styled Components
const ArticlesPage = styled.main`
  width: var(--content-width);
  margin: 0 auto;
  padding: 120px 0 80px;
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 90px 0 60px;
  }
`;

const ArticlesHeader = styled.header`
  padding: 48px 40px;
  text-align: center;
  margin-bottom: 36px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: var(--bg-1);
  border: var(--border);
  border-radius: var(--card-radius);
  box-shadow: var(--box-shadow);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--box-shadow);
  }

  @media (max-width: 768px) {
    padding: 32px 20px;
    margin-bottom: 24px;
    border-radius: 18px;
  }
`;

const HeaderContent = styled.div`
  p {
    color: var(--text-2);
  }
`;

const PageTitle = styled.h1`
  font-size: 2.6rem;
  font-family: var(--title-font);
  margin-bottom: 12px;
  color: var(--main-color);
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-2);
  margin-bottom: 24px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 18px;
  }
`;

const StatsRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 8px 20px;
  background: color-mix(in oklab, var(--main-color) 8%, oklch(0 0 0 / 0));
  border: 1px solid color-mix(in oklab, var(--main-color) 20%, oklch(0 0 0 / 0));
  border-radius: 999px;
  font-size: 0.9rem;
  color: var(--text-1);

  @media (max-width: 480px) {
    font-size: 0.8rem;
    gap: 10px;
    padding: 6px 14px;
  }
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;

  i {
    color: var(--main-color);
  }
`;

const ArticlesSection = styled.section``;

const ArticleGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
`;

const ArticleItemWrapper = styled.div`
  transition: opacity 0.3s ease, transform 0.3s ease;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  margin: 20px 0;

  .empty-icon { font-size: 3rem; color: var(--main-color); opacity: 0.7; margin-bottom: 16px; }
  h3 { font-size: 1.4rem; margin-bottom: 8px; }
`;
