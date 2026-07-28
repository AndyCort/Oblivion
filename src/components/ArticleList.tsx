import React, { useState } from 'react';
import styled from 'styled-components';
import ArticleCard from './ArticleCard';
import { useLocale } from '../i18n/useLocale';

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
  const { locale, t } = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalArticles = articles.length;
  const totalPages = Math.ceil(totalArticles / pageSize);

  const showPage = (page: number) => {
    setCurrentPage(page);
    const el = document.getElementById('article-list');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

        {totalPages > 1 && (
          <PaginationContainer id="pagination">
            <PaginationBtn
              disabled={currentPage === 1}
              onClick={() => showPage(currentPage - 1)}
            >
              <i className="fas fa-chevron-left"></i>
              <span>{locale === 'en-US' ? 'Previous' : '上一页'}</span>
            </PaginationBtn>

            <PaginationNumbers>
              {getPaginationNumbers().map((p, i) => (
                <PaginationNum
                  key={i}
                  $isActive={p === currentPage}
                  $isEllipsis={p === '...'}
                  disabled={p === '...'}
                  onClick={() => p !== '...' && showPage(p as number)}
                >
                  {p}
                </PaginationNum>
              ))}
            </PaginationNumbers>

            <PaginationBtn
              disabled={currentPage === totalPages}
              onClick={() => showPage(currentPage + 1)}
            >
              <span>{locale === 'en-US' ? 'Next' : '下一页'}</span>
              <i className="fas fa-chevron-right"></i>
            </PaginationBtn>
          </PaginationContainer>
        )}
      </ListContainer>

      {totalArticles === 0 && (
        <EmptyState>
          <i className="far fa-folder-open"></i>
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

  i { font-size: 48px; }
  p { font-size: 16px; }
`;

const PaginationContainer = styled.div`
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
`;

const PaginationBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: var(--border);
  border-radius: 8px;
  background: var(--bg-1);
  color: var(--text-1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  i { font-size: 12px; }

  &:hover:not(:disabled) {
    background: var(--main-color);
    transform: translateY(-2px);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.8rem;
    span { display: none; }
  }
`;

const PaginationNumbers = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    order: -1;
    width: 100%;
    justify-content: center;
    gap: 6px;
  }
`;

const PaginationNum = styled.button<{ $isActive?: boolean; $isEllipsis?: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--border);
  border-radius: 8px;
  background: var(--bg-1);
  color: var(--text-1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => props.$isEllipsis && `
    cursor: default;
    background: transparent;
    border: none;
  `}

  ${props => !props.$isEllipsis && `
    &:hover:not(:disabled):not(.active) {
      background: var(--main-color);
    }
  `}

  ${props => props.$isActive && `
    color: var(--main-color);
    border-color: var(--main-color);
    font-weight: 600;
  `}

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
`;
