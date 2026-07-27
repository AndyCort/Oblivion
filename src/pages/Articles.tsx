import React, { useEffect, useMemo } from 'react';
import '../styles/Articles.css';
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

      <main className="articles-page">
        <header className="articles-header">
          <div className="header-content">
            <h1 className="page-title">{pageTitle}</h1>
            <p className="page-subtitle">{pageSubtitle}</p>

            <div className="stats-row">
              <span className="stat-item">
                <i className="fa-solid fa-newspaper"></i>
                <strong>{articles.length}</strong>
                {locale === "zh-CN" ? "篇文章" : "Articles"}
              </span>
              <span className="stat-divider">•</span>
              <span className="stat-item">
                <i className="fa-solid fa-tags"></i>
                <strong>{tagsList.length}</strong>
                {locale === "zh-CN" ? "个标签" : "Tags"}
              </span>
            </div>
          </div>
        </header>

        <ArticleSearch articles={articles} tagsList={tagsList} />
      </main>
    </MainLayout>
  );
}
