import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/layout/Background';
import SideButton from '../components/layout/SideButton';
import ArticleCard from '../components/articles/ArticleCard';

import { useArticles } from '../hooks/useArticles';
import { useLocale } from '../i18n/useLocale';
import { getLocalizedField } from '../i18n/utils';
import Pagination from '../components/common/Pagination';
import { Search as SearchIcon, FolderOpen } from 'lucide-react';

export default function Search() {
  const { locale, siteName } = useLocale();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('s') || '';

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
  useEffect(() => { setCurrentPage(1); }, [query, locale]);
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
    document.title = `${locale === 'zh-CN' ? '搜索结果' : 'Search Results'} — ${siteName}`;
  }, [locale, siteName]);

  return (
    <MainLayout>
      <SideButton />
      <Background />

      <SearchPageContainer>
        <header className="search-header" data-card>
          <div className="header-content">
            <h1 className="page-title">{locale === 'zh-CN' ? '搜索结果' : 'Search Results'}</h1>
            <p className="page-subtitle">
              {query
                ? (locale === 'zh-CN' ? `包含关键字 "${query}" 的文章` : `Articles containing "${query}"`)
                : (locale === 'zh-CN' ? '请输入关键字进行搜索' : 'Please enter a keyword to search')}
            </p>
          </div>
        </header>

        <section className="articles-section">
          {loading ? (
            <p role="status">{locale === "zh-CN" ? "加载中…" : "Loading…"}</p>
          ) : query.trim() === '' ? (
            <div className="empty-state" data-card>
              <div className="empty-icon"><SearchIcon size={48} /></div>
              <h3>{locale === "zh-CN" ? "请输入搜索词" : "Enter a search term"}</h3>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="article-grid">
              {visibleArticles.map((article) => (
                <div className="article-item" key={article.slug}>
                  <ArticleCard
                    title={article.title}
                    summary={article.summary}
                    author={article.author}
                    date={article.date}
                    tags={article.tags}
                    cover={article.cover}
                    slug={article.slug}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" data-card>
              <div className="empty-icon"><FolderOpen size={48} /></div>
              <h3>{locale === "zh-CN" ? "未找到相关文章" : "No articles found"}</h3>
            </div>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </section>
      </SearchPageContainer>
    </MainLayout>
  );
}

// Styled Components
const SearchPageContainer = styled.main`
  width: var(--content-width);
  margin: 0 auto;
  padding: 120px 0 80px;
  min-height: 100vh;
  box-sizing: border-box;

  .search-header {
    padding: 48px 40px;
    text-align: center;
    margin-bottom: 36px;
  }

  .page-title {
    font-size: 2.6rem;
    font-family: var(--title-font);
    margin-bottom: 12px;
    background: linear-gradient(135deg, var(--main-color), oklch(0.645032 0.215403 16.439));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: oklch(0 0 0 / 0);
    color: transparent;
  }

  .page-subtitle {
    font-size: 1.1rem;
    color: var(--text-2);
  }

  .article-grid {
    display: flex;
    flex-direction: column;
    gap: 28px;
    width: 100%;
  }

  .article-item {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    margin: 20px 0;

    .empty-icon {
      font-size: 3rem;
      color: var(--main-color);
      opacity: 0.7;
      margin-bottom: 16px;
    }

    h3 {
      font-size: 1.4rem;
      margin-bottom: 8px;
    }
  }

  @media (max-width: 768px) {
    padding: 90px 0 60px;
    .search-header {
      padding: 32px 20px;
    }
    .page-title {
      font-size: 2rem;
    }
  }
`;
