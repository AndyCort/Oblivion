import React, { useState } from 'react';
import styled from 'styled-components';
import ArticleCard from './ArticleCard';
import Pagination from './Pagination';
import { useLocale } from '../i18n/useLocale';
import { FolderOpen } from 'lucide-react';

interface ArticleData {
  slug: string;
  title: any;
  summary?: any;
  date: string;
  tags?: string[];
  cover?: string;
}

interface Props {
  articles: ArticleData[];
}

export default function ArticleList({ articles = [] }: Props) {
  const { t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalArticles = articles.length;
  const totalPages = Math.ceil(totalArticles / pageSize);

  const showPage = (page: number) => {
    setCurrentPage(page);
    const el = document.getElementById('article-list');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const visibleArticles = articles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <ListContainer id="article-list">
        <GridContainer id="article-grid">
          {visibleArticles.map((article, idx) => (
            <div className="article-item" key={article.slug || idx}>
              <ArticleCard
                title={article.title}
                summary={article.summary}
                date={article.date}
                tags={article.tags}
                cover={article.cover}
                slug={article.slug}
              />
            </div>
          ))}
        </GridContainer>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={showPage} />
      </ListContainer>

      {totalArticles === 0 && (
        <EmptyState>
          <FolderOpen size={48} />
          <p>{t('articles.noArticles')}</p>
        </EmptyState>
      )}
    </>
  );
}

// Styled Components

const ListContainer = styled.div`
  padding: 20px;
  width: clamp(800px, 80%, 1200px);
  margin: 0 auto;

  @media (max-width: 768px) {
    width: 100%;
    padding: 12px;
  }
  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 20px;
  color: var(--text-1);
  opacity: 0.6;

  svg { width: 48px; height: 48px; }
  p { font-size: 16px; }
`;
