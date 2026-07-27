import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import MainLayout from '../layouts/MainLayout';
import Background from '../components/Background';
import SideButton from '../components/SideButton';
import MusicIsland from '../components/MusicIsland';
import Toc from '../components/Toc';

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

      <ArticleDetailContainer>
        <BackButton to="/articles">
          ← {locale === "zh-CN" ? "返回列表" : "Back"}
        </BackButton>

        <ArticleTitle>{titleText}</ArticleTitle>

        <ArticleMeta>
          <span>
            <i className="fa-solid fa-calendar"></i> {article.date}
          </span>
          {article.tags && article.tags.length > 0 && (
            <span>
              <i className="fa-solid fa-tags" /> {article.tags.join(", ")}
            </span>
          )}
        </ArticleMeta>

        {coverUrl && <ArticleCover src={coverUrl} alt={titleText} />}

        <ArticleBody className="article-markdown-body">
          <div className="wmde-markdown">
            {article.Content ? (
              <article.Content />
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {contentText as string}
              </ReactMarkdown>
            )}
          </div>
        </ArticleBody>
      </ArticleDetailContainer>

      <Toc headings={headings} />
    </MainLayout>
  );
}

const ArticleDetailContainer = styled.article`
  max-width: 900px;
  margin: 100px auto 60px;
  padding: 40px 30px;
  background: var(--glass-bg-color);
  border: 1px solid var(--glass-border-color);
  border-radius: 24px;
  box-shadow: var(--glass-box-shadow);
  color: var(--text-color);

  @media (max-width: 768px) {
    margin: 80px 16px 40px;
    padding: 24px 18px;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid var(--glass-border-color);
  color: var(--text-1);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    background: var(--main-color);
    border-color: var(--main-color);
    color: var(--text-0);
  }
`;

const ArticleTitle = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 16px;
  color: var(--title-color);
  line-height: 1.3;
`;

const ArticleMeta = styled.div`
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: var(--text-3);
  opacity: 0.7;
  margin-bottom: 24px;
`;

const ArticleCover = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 30px;
`;

const ArticleBody = styled.div``;
