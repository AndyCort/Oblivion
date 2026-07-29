import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/atom-one-dark.css';

import MainLayout from '../layouts/MainLayout';
import Background from '../components/Background';
import SideButton from '../components/SideButton';
import MusicIsland from '../components/MusicIsland';
import Toc from '../components/Toc';

import '../styles/ArticleDetail.css';
import '../styles/markdown.css';

import { getLocalMarkdownArticles } from '../api/mdArticles';
import { MOCK_ARTICLES } from '../api/articles';
import { getLocalizedField } from '../i18n/utils';
import { useLocale } from '../i18n/useLocale';
import { Copy, Check, Calendar, Tags } from 'lucide-react';

const Pre = ({ children, ...props }: any) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (preRef.current) {
      const text = preRef.current.innerText;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text', err);
      }
    }
  };

  return (
    <div className="code-block-wrapper">
      <button
        className={`copy-button ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        aria-label="Copy code"
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </div>
  );
};

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { locale } = useLocale();

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
    "--home-bg";
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

      <article className="article-detail-container" data-card="base">
        <Link className="back-button" to="/articles">
          ← {locale === "zh-CN" ? "返回列表" : "Back"}
        </Link>

        <h1 className="article-title">{titleText}</h1>

        <div className="article-meta">
          <span>
            <Calendar size={14} /> {article.date}
          </span>
          {article.tags && article.tags.length > 0 && (
            <span>
              <Tags size={14} /> {article.tags.join(", ")}
            </span>
          )}
        </div>

        {coverUrl && <img className="article-cover" src={coverUrl} alt={titleText as string} />}

        <div className="article-body article-markdown-body">
          <div className="wmde-markdown">
            {article.Content ? (
              <article.Content />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
                components={{ pre: Pre }}
              >
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
