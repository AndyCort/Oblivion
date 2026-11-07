import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/layout/Background';
import SideButton from '../components/layout/SideButton';
import ArticleCard from '../components/articles/ArticleCard';

import { useArticles } from '../hooks/useArticles';
import { useLocale } from '../i18n/useLocale';
import { useCardStyle } from '../stores/themeStore';
import Pagination from '../components/common/Pagination';
import { Newspaper, FolderOpen } from 'lucide-react';

export default function Articles() {
  const { cardStyle } = useCardStyle();
  const { locale, siteName } = useLocale();
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
    document.title = `${pageTitle} — ${siteName}`;
  }, [pageTitle, siteName]);

  return (
    <MainLayout>
      <SideButton />
      <Background />

      <ArticlesPage>
        <header className="articles-header" data-card={cardStyle}>
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

        <section className="articles-section">
          {loading ? (
            <p role="status">{locale === "zh-CN" ? "加载中…" : "Loading…"}</p>
          ) : articles.length > 0 ? (
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
                    pinned={article.pinned}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" data-card={cardStyle}>
              <div className="empty-icon"><FolderOpen size={48} /></div>
              <h3>{locale === "zh-CN" ? "暂无文章" : "No articles"}</h3>
            </div>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </section>
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

  @media (max-width: 48rem) {
    padding: 90px 0 60px;
  }

  .articles-header {
    padding: 48px 40px;
    text-align: center;
    margin-bottom: 36px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }

    @media (max-width: 48rem) {
      padding: 32px 20px;
      margin-bottom: 24px;
    }
  }

  .header-content p {
    color: var(--text-2);
  }

  .page-title {
    font-size: var(--text-page-title);
    font-family: var(--title-font);
    margin-bottom: 12px;
    color: var(--main-color);
    line-height: var(--leading-heading);

  }

  .page-subtitle {
    font-size: var(--text-body);
    color: var(--text-2);
    margin-bottom: 24px;
    line-height: var(--leading-body);

    @media (max-width: 48rem) {
      font-size: var(--text-body);
      margin-bottom: 18px;
    }
  }

  .stats-row {
    display: inline-flex;
    flex-wrap: wrap;
    max-width: 100%;
    align-items: center;
    gap: 16px;
    padding: 8px 20px;
    background: color-mix(in oklab, var(--main-color) 8%, oklch(0 0 0 / 0));
    border: 1px solid color-mix(in oklab, var(--main-color) 20%, oklch(0 0 0 / 0));
    border-radius: 999px;
    font-size: var(--text-meta);
    color: var(--text-1);

    @media (max-width: 30rem) {
      font-size: var(--text-meta);
      gap: 10px;
      padding: 6px 14px;
    }
  }

  .stat-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;

    svg {
      color: var(--main-color);
    }
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
      font-size: var(--text-section);
      margin-bottom: 8px;
    }
  }
`;
