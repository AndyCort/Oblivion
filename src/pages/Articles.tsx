import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import '../styles/Articles.css';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/Background';
import SideButton from '../components/SideButton';
import ArticleCard from '../components/ArticleCard';

import { getLocalMarkdownArticles } from '../api/mdArticles';
import { MOCK_ARTICLES } from '../api/articles';
import { useLocale } from '../i18n/useLocale';
import Pagination from '../components/Pagination';
import { Newspaper, FolderOpen } from 'lucide-react';

export default function Articles() {
  const { locale } = useLocale();
  const mdArticles = getLocalMarkdownArticles();

  const articles = useMemo(() => {
    return (mdArticles.length > 0 ? mdArticles : MOCK_ARTICLES).map((a) => ({
      slug: a.id,
      title: a.title,
      summary: a.summary,
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

      <main className="articles-page">
        <header className="articles-header" data-hover>
          <div className="header-content">
            <h1 className="page-title">{pageTitle}</h1>
            <p className="page-subtitle">{pageSubtitle}</p>

            <div className="stats-row">
              <span className="stat-item">
                <Newspaper size={18} />
                <strong>{articles.length}</strong>
                {locale === "zh-CN" ? "篇文章" : "Articles"}
              </span>
            </div>
          </div>
        </header>

        <ArticlesSection>
          {articles.length > 0 ? (
            <ArticleGrid>
              {visibleArticles.map((article, idx) => (
                <ArticleItemWrapper key={article.slug || idx}>
                  <ArticleCard
                    title={article.title}
                    summary={article.summary}
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
      </main>
    </MainLayout>
  );
}

// Styled Components
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
