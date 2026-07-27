import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import ArticleCard from './ArticleCard';
import { useLocale } from '../i18n/useLocale';
import { getLocalizedField } from '../i18n/utils';

interface ArticleData {
  slug: string;
  title: any;
  summary?: any;
  date: string;
  tags: string[];
  cover?: string;
}

interface Props {
  articles: ArticleData[];
  tagsList: [string, number][];
}

export default function ArticleSearch({ articles, tagsList }: Props) {
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const titleText = getLocalizedField(article.title, locale);
      const summaryText = getLocalizedField(article.summary, locale);
      const searchKey = `${titleText} ${summaryText} ${article.tags.join(" ")}`.toLowerCase();

      const matchesTag = activeTag === 'all' || article.tags.includes(activeTag);
      const matchesSearch = !searchQuery || searchKey.includes(searchQuery.toLowerCase().trim());

      return matchesTag && matchesSearch;
    });
  }, [articles, locale, searchQuery, activeTag]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
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
    document.querySelector('.controls-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveTag('all');
    setCurrentPage(1);
  };

  return (
    <>
      <ControlsSection className="controls-section">
        <SearchBox>
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === "zh-CN" ? "搜索文章标题、摘要或标签..." : "Search by title, summary or tags..."}
            autoComplete="off"
          />
          {searchQuery && (
            <ClearBtn
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
            >
              <i className="fa-solid fa-xmark"></i>
            </ClearBtn>
          )}
        </SearchBox>

        {tagsList.length > 0 && (
          <TagsFilterWrapper>
            <TagsFilter>
              <TagPill 
                $isActive={activeTag === 'all'}
                onClick={() => { setActiveTag('all'); setCurrentPage(1); }}
              >
                {locale === "zh-CN" ? "全部" : "All"}
                <span className="count">{articles.length}</span>
              </TagPill>
              {tagsList.map(([tag, count]) => (
                <TagPill 
                  key={tag}
                  $isActive={activeTag === tag}
                  onClick={() => { setActiveTag(tag); setCurrentPage(1); }}
                >
                  <i className="fa-solid fa-hashtag"></i>
                  {tag}
                  <span className="count">{count}</span>
                </TagPill>
              ))}
            </TagsFilter>
          </TagsFilterWrapper>
        )}
      </ControlsSection>

      <ArticlesSection>
        {filteredArticles.length > 0 ? (
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
          <EmptyState>
            <div className="empty-icon">
              <i className="fa-regular fa-folder-open"></i>
            </div>
            <h3>
              {locale === "zh-CN" ? "未找到相关文章" : "No articles found"}
            </h3>
            <p>
              {locale === "zh-CN" ? "尝试更换关键字或取消标签筛选" : "Try adjusting your search query or tag filter."}
            </p>
            <ResetBtn onClick={resetFilters}>
              {locale === "zh-CN" ? "重置筛选" : "Reset Filters"}
            </ResetBtn>
          </EmptyState>
        )}

        {totalPages > 1 && (
          <PaginationContainer>
            <PaginationBtn 
              disabled={currentPage === 1} 
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <i className="fas fa-chevron-left"></i>
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
              <i className="fas fa-chevron-right"></i>
            </PaginationBtn>
          </PaginationContainer>
        )}
      </ArticlesSection>
    </>
  );
}

// Styled Components

const ControlsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    gap: 16px;
    margin-bottom: 28px;
  }
`;

const SearchBox = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;

  .search-icon {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-3);
    opacity: 0.5;
    font-size: 1rem;
    pointer-events: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 44px 14px 48px;
  font-size: 1rem;
  font-family: var(--content-font);
  color: var(--text-1);
  background: var(--glass-bg-color);
  border: 1px solid var(--glass-border-color);
  border-radius: 16px;
  box-shadow: var(--glass-box-shadow);
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    border-color: var(--main-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--main-color) 20%, transparent);
  }

  &::placeholder {
    color: var(--text-3);
    opacity: 0.45;
  }
`;

const ClearBtn = styled.button`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    color: var(--main-color);
  }
`;

const TagsFilterWrapper = styled.div`
  overflow-x: auto;
  padding: 4px 0 10px;
  margin: 0 -4px;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--text-3) 15%, transparent);
    border-radius: 2px;
  }
`;

const TagsFilter = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    justify-content: flex-start;
    flex-wrap: nowrap;
    padding-bottom: 4px;
  }
`;

const TagPill = styled.button<{ $isActive?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.88rem;
  font-family: var(--content-font);
  font-weight: 500;
  color: var(--text-3);
  background: var(--glass-bg-color);
  border: 1px solid var(--glass-border-color);
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);

  i {
    font-size: 0.75rem;
    opacity: 0.6;
  }

  .count {
    font-size: 0.75rem;
    padding: 2px 7px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--text-color) 10%, transparent);
    margin-left: 2px;
    transition: all 0.25s ease;
  }

  &:hover {
    border-color: var(--main-color);
    color: var(--main-color);
    transform: translateY(-2px);
  }

  ${props => props.$isActive && `
    border-color: var(--main-color);
    color: var(--main-color);

    i {
      opacity: 0.9;
      color: var(--main-color);
    }

    .count {
      background: rgba(255, 255, 255, 0.25);
      color: var(--main-color);
    }
  `}
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
  background: var(--glass-bg-color);
  border: 1px dashed var(--glass-border-color);
  border-radius: 20px;
  margin: 20px 0;

  .empty-icon {
    font-size: 3rem;
    color: var(--main-color);
    opacity: 0.7;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 1.4rem;
    color: var(--title-color);
    margin-bottom: 8px;
  }

  p {
    font-size: 0.95rem;
    color: var(--text-1);
    opacity: 0.7;
    margin-bottom: 24px;
  }
`;

const ResetBtn = styled.button`
  padding: 10px 24px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #fff;
  background: var(--main-color);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px color-mix(in srgb, var(--main-color) 40%, transparent);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 48px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 32px;
  }
`;

const PaginationBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid var(--glass-border-color);
  border-radius: 12px;
  background: var(--glass-bg-color);
  color: var(--text-1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  i { font-size: 12px; }

  &:hover:not(:disabled) {
    background: var(--main-color);
    color: #fff;
    border-color: var(--main-color);
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
  border: 1px solid var(--glass-border-color);
  border-radius: 12px;
  background: var(--glass-bg-color);
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
      color: #fff;
      border-color: var(--main-color);
    }
  `}

  ${props => props.$isActive && `
    background: var(--main-color);
    color: #fff;
    border-color: var(--main-color);
    font-weight: 600;
    box-shadow: 0 4px 14px color-mix(in srgb, var(--main-color) 35%, transparent);
  `}

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
`;
