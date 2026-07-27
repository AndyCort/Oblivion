import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/Background';
import SideButton from '../components/SideButton';
import MusicIsland from '../components/MusicIsland';
import ArticleSearch from '../components/ArticleSearch';

import { getLocalMarkdownArticles } from '../api/mdArticles';
import { MOCK_ARTICLES } from '../api/articles';
import { getLocale } from '../i18n/utils';

export default function Articles() {
  const locale = getLocale();
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

  const tagsList = useMemo(() => {
    const tagCounts = new Map<string, number>();
    articles.forEach((article) => {
      article.tags.forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]);
  }, [articles]);

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
      <MusicIsland />
      <Background />

      <ArticlesPage>
        <ArticlesHeader>
          <HeaderContent>
            <PageTitle>{pageTitle}</PageTitle>
            <PageSubtitle>{pageSubtitle}</PageSubtitle>

            <StatsRow>
              <StatItem>
                <i className="fa-solid fa-newspaper"></i>
                <strong>{articles.length}</strong>
                {locale === "zh-CN" ? "篇文章" : "Articles"}
              </StatItem>
              <StatDivider>•</StatDivider>
              <StatItem>
                <i className="fa-solid fa-tags"></i>
                <strong>{tagsList.length}</strong>
                {locale === "zh-CN" ? "个标签" : "Tags"}
              </StatItem>
            </StatsRow>
          </HeaderContent>
        </ArticlesHeader>

        <ArticleSearch articles={articles} tagsList={tagsList} />
      </ArticlesPage>
    </MainLayout>
  );
}

const ArticlesPage = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: 120px 20px 80px;
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 90px 16px 60px;
  }
`;

const ArticlesHeader = styled.header`
  background: var(--glass-bg-color);
  border: 1px solid var(--glass-border-color);
  border-radius: 24px;
  box-shadow: var(--glass-box-shadow);
  padding: 48px 40px;
  text-align: center;
  margin-bottom: 36px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 32px 20px;
    margin-bottom: 24px;
    border-radius: 18px;
  }
`;

const HeaderContent = styled.div``;

const PageTitle = styled.h1`
  font-size: 2.6rem;
  font-family: var(--title-font);
  color: var(--title-color);
  margin-bottom: 12px;
  background: linear-gradient(135deg, var(--main-color), #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-1);
  opacity: 0.8;
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
  background: color-mix(in srgb, var(--main-color) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--main-color) 20%, transparent);
  border-radius: 999px;
  font-size: 0.9rem;
  color: var(--text-3);

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

const StatDivider = styled.span`
  opacity: 0.4;
`;
