import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/Background';
import SideButton from '../components/SideButton';
import ArticleCard from '../components/ArticleCard';

import { getLocalMarkdownArticles } from '../api/mdArticles';
import { MOCK_ARTICLES } from '../api/articles';
import { useLocale } from '../i18n/useLocale';
import { getLocalizedField } from '../i18n/utils';
import Pagination from '../components/Pagination';
import { Search as SearchIcon, FolderOpen } from 'lucide-react';

export default function Search() {
  const { locale } = useLocale();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('s') || '';

  const mdArticles = getLocalMarkdownArticles();

  const articles = useMemo(() => {
    return (mdArticles.length > 0 ? mdArticles : MOCK_ARTICLES).map((a) => ({
      slug: a.id,
      title: a.title,
      summary: a.summary,
      author: a.author,
      date: a.date,
      tags: a.tags || [],
      cover: a.cover || a.featuredImage,
    }));
  }, [mdArticles]);

  const filteredArticles = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return articles.filter(article => {
      const titleText = getLocalizedField(article.title, locale);
      const summaryText = getLocalizedField(article.summary, locale);
      const searchKey = `${titleText} ${summaryText} ${article.tags.join(" ")}`.toLowerCase();
      return searchKey.includes(q);
    });
  }, [articles, locale, query]);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const visibleArticles = filteredArticles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    document.title = `${locale === 'zh-CN' ? '搜索结果' : 'Search Results'} — Oblivion`;
  }, [locale]);

  return (
    <MainLayout>
      <SideButton />
      <Background />

      <SearchPageContainer>
        <header className="search-header" data-card="base">
          <div className="header-content">
            <h1 className="page-title">{locale === 'zh-CN' ? '搜索结果' : 'Search Results'}</h1>
            <p className="page-subtitle">
              {query
                ? (locale === 'zh-CN' ? `包含关键字 "${query}" 的文章` : `Articles containing "${query}"`)
                : (locale === 'zh-CN' ? '请输入关键字进行搜索' : 'Please enter a keyword to search')}
            </p>
          </div>
        </header>

        <ArticlesSection>
          {query.trim() === '' ? (
            <EmptyState data-card="base">
              <div className="empty-icon"><SearchIcon size={48} /></div>
              <h3>{locale === "zh-CN" ? "请输入搜索词" : "Enter a search term"}</h3>
            </EmptyState>
          ) : filteredArticles.length > 0 ? (
            <ArticleGrid>
              {visibleArticles.map((article, idx) => (
                <ArticleItemWrapper key={article.slug || idx}>
                  <ArticleCard
                    title={article.title}
                    summary={article.summary}
                    author={article.author}
                    date={article.date}
                    tags={article.tags}
                    cover={article.cover}
                    slug={article.slug}
                  />
                </ArticleItemWrapper>
              ))}
            </ArticleGrid>
          ) : (
            <EmptyState data-card="base">
              <div className="empty-icon"><FolderOpen size={48} /></div>
              <h3>{locale === "zh-CN" ? "未找到相关文章" : "No articles found"}</h3>
            </EmptyState>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </ArticlesSection>
      </SearchPageContainer>
    </MainLayout>
  );
}

// Styled Components
const SearchPageContainer = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: 120px 20px 80px;
  min-height: 100vh;
  box-sizing: border-box;

  .search-header {
    padding: 48px 40px;
    text-align: center;
    margin-bottom: 36px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .page-title {
    font-size: 2.6rem;
    font-family: var(--title-font);

    margin-bottom: 12px;
    background: linear-gradient(135deg, var(--main-color), #f43f5e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .page-subtitle {
    font-size: 1.1rem;
    color: var(--text-1);
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    padding: 90px 16px 60px;
    .search-header { padding: 32px 20px; border-radius: var(--card-radius); }
    .page-title { font-size: 2rem; }
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
  h3 { font-size: 1.4rem;  margin-bottom: 8px; }
`;
