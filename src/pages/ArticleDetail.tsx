import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import MainLayout from '../layouts/MainLayout';
import Background from '../components/Background';
import SideButton from '../components/SideButton';
import MusicIsland from '../components/MusicIsland';
import Toc from '../components/Toc';

import '../styles/ArticleDetail.css';
import '../styles/markdown.css';

import { getLocalMarkdownArticles } from '../api/mdArticles';
import { MOCK_ARTICLES } from '../api/articles';
import { getLocale, getLocalizedField } from '../i18n/utils';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const locale = getLocale();

  const article = useMemo(() => {
    const mdArticles = getLocalMarkdownArticles();
    const allArticles = mdArticles.length > 0 ? mdArticles : MOCK_ARTICLES;
    return allArticles.find((a) => a.id === slug);
  }, [slug]);

  useEffect(() => {
    if (!article && slug) {
      navigate('/articles');
    }
  }, [article, slug, navigate]);

  if (!article) return null;

  const titleText = getLocalizedField(article.title, locale);
  const summaryText = getLocalizedField(article.summary, locale);
  const contentText = article.content
    ? getLocalizedField(article.content, locale)
    : summaryText;

  const defaultCover =
    "https://images.unsplash.com/photo-1587279535322-b20697908487?auto=format&fit=crop&w=800&q=80";
  const coverUrl = article.cover || article.featuredImage || defaultCover;

  const rawHeadings = article.headings || [];
  const headings = rawHeadings.map((h: any) => ({
    level: h.depth,
    id: h.slug,
    text: h.text,
  }));

  useEffect(() => {
    document.title = `${titleText} — Oblivion`;
  }, [titleText]);

  return (
    <MainLayout>
      <SideButton />
      <MusicIsland />
      <Background />

      <article className="article-detail-container">
        <Link className="back-button" to="/articles">
          ← {locale === "zh-CN" ? "返回列表" : "Back"}
        </Link>

        <h1 className="article-title">{titleText}</h1>

        <div className="article-meta">
          <span>
            <i className="fa-solid fa-calendar"></i> {article.date}
          </span>
          {article.tags && article.tags.length > 0 && (
            <span>
              <i className="fa-solid fa-tags" /> {article.tags.join(", ")}
            </span>
          )}
        </div>

        {coverUrl && <img className="article-cover" src={coverUrl} alt={titleText as string} />}

        <div className="article-body article-markdown-body">
          <div className="wmde-markdown">
            {article.Content ? (
              <article.Content />
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {contentText as string}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </article>

      <Toc headings={headings} />
    </MainLayout>
  );
}
