import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/Background';
import SideButton from '../components/SideButton';
import MusicIsland from '../components/MusicIsland';
import ArticleCard from '../components/ArticleCard';

import { getLocalMarkdownArticles } from '../api/mdArticles';
import { MOCK_ARTICLES } from '../api/articles';
import { useLocale } from '../i18n/useLocale';
import { getLocalizedField } from '../i18n/utils';
import { Search as SearchIcon, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const getPaginationNumbers = () => {
    let pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages = [1, 2, 3, 4, '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
    return pages;
  };

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
      <MusicIsland />
      <Background />

      <SearchPageContainer>
        <header className="search-header" data-card="base" data-hover>
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

          {totalPages > 1 && query.trim() !== '' && (
            <PaginationContainer>
              <PaginationBtn
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft size={16} />
                <span>{locale === 'zh-CN' ? '上一页' : 'Previous'}</span>
              </PaginationBtn>

              <PaginationNumbers>
                {getPaginationNumbers().map((p, i) => (
                  <PaginationNum
                    key={i}
                    $isActive={p === currentPage}
                    $isEllipsis={p === '...'}
                    disabled={p === '...'}
                    onClick={() => p !== '...' && handlePageChange(p as number)}
                  >
                    {p}
                  </PaginationNum>
                ))}
              </PaginationNumbers>

              <PaginationBtn
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <span>{locale === 'zh-CN' ? '下一页' : 'Next'}</span>
                <ChevronRight size={16} />
              </PaginationBtn>
            </PaginationContainer>
          )}
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
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 48px;
  @media (max-width: 768px) { flex-wrap: wrap; gap: 10px; margin-top: 32px; }
`;
const PaginationBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-1);
  color: var(--text-1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover:not(:disabled) { background: var(--main-color); color: #fff; border-color: var(--main-color); transform: translateY(-2px); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  @media (max-width: 768px) { padding: 8px 12px; font-size: 0.8rem; span { display: none; } }
`;
const PaginationNumbers = styled.div`
  display: flex;
  gap: 8px;
  @media (max-width: 768px) { order: -1; width: 100%; justify-content: center; gap: 6px; }
`;
const PaginationNum = styled.button<{ $isActive?: boolean; $isEllipsis?: boolean }>`
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border);
  border-radius: 12px; background: var(--bg-1);
  color: var(--text-1); font-size: 0.9rem; cursor: pointer; transition: all 0.3s ease;
  ${props => props.$isEllipsis && `cursor: default; background: transparent; border: none;`}
  ${props => !props.$isEllipsis && `&:hover:not(:disabled):not(.active) { background: var(--main-color); color: #fff; border-color: var(--main-color); }`}
  ${props => props.$isActive && `background: var(--main-color); color: #fff; border-color: var(--main-color); font-weight: 600; box-shadow: 0 4px 14px color-mix(in srgb, var(--main-color) 35%, transparent);`}
  @media (max-width: 768px) { width: 32px; height: 32px; font-size: 0.8rem; }
`;
