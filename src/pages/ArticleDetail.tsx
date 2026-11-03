import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown, { type ExtraProps } from 'react-markdown';
import type { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/atom-one-dark.css';

import MainLayout from '../layouts/MainLayout';
import Background from '../components/layout/Background';
import SideButton from '../components/layout/SideButton';
import Toc from '../components/articles/Toc';

import '../styles/markdown.css';

import { fetchArticle, type Article } from '../api/articles';
import { parseHeadings } from '../api/mdArticles';
import { getLocalizedField } from '../i18n/utils';
import { useLocale } from '../i18n/useLocale';
import { Copy, Check, Calendar, Tags, User } from 'lucide-react';

const Pre = ({ children, node: _node, ...props }: ComponentPropsWithoutRef<'pre'> & ExtraProps) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const handleCopy = async () => {
    if (preRef.current) {
      const text = preRef.current.innerText;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), 2000);
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

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setArticle(null);
    if (slug) {
      fetchArticle(slug, controller.signal)
        .then((a) => { if (!controller.signal.aborted) setArticle(a); })
        .catch(() => {})
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    } else {
      setLoading(false);
    }
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!loading && !article && slug) {
      navigate('/articles');
    }
  }, [article, loading, slug, navigate]);

  // 注意：这个 effect 必须放在提前返回之前，否则 hook 数量在文章加载前后不一致会崩溃
  const titleText = article ? getLocalizedField(article.title, locale) : '';

  useEffect(() => {
    document.title = `${titleText || '文章'} — Oblivion`;
  }, [titleText]);

  if (!article) return null;

  const summaryText = getLocalizedField(article.summary, locale);
  const contentText = article.content
    ? getLocalizedField(article.content, locale)
    : summaryText;

  const coverUrl = article.cover || article.featuredImage || 'var(--home-bg)';

  // 目录跟随当前语言正文生成，避免双语文章下目录显示另一种语言
  const headings = parseHeadings(contentText).map((h) => ({
    level: h.depth,
    id: h.slug,
    text: h.text,
  }));

  return (
    <MainLayout>
      <SideButton />
      <Background />

      <DetailArticle data-card="base">
        <BackButton to="/articles" data-card data-button>
          ← {locale === "zh-CN" ? "返回列表" : "Back"}
        </BackButton>

        <ArticleTitle>{titleText}</ArticleTitle>

        <ArticleMeta>
          {article.author && (
            <span>
              <User size={14} /> {article.author}
            </span>
          )}
          <span>
            <Calendar size={14} /> {article.date}
          </span>
        </ArticleMeta>

        {article.tags && article.tags.length > 0 && (
          <ArticleTags>
            <ArticleTagsLabel>
              <Tags size={14} />
              {locale === "zh-CN" ? "标签" : "Tags"}
            </ArticleTagsLabel>
            <ArticleTagsList>
              {article.tags.map((tag, idx) => (
                <ArticleTag
                  key={`${tag}-${idx}`}
                  to={`/search?s=${encodeURIComponent(tag)}`}
                >
                  {tag}
                </ArticleTag>
              ))}
            </ArticleTagsList>
          </ArticleTags>
        )}

        {summaryText && article.content && (
          <ArticleSummary>{summaryText}</ArticleSummary>
        )}

        {article.cover || article.featuredImage ? (
          <ArticleCover src={coverUrl} alt={titleText as string} />
        ) : null}

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
      </DetailArticle>

      <Toc headings={headings} />
    </MainLayout>
  );
}

const DetailArticle = styled.article`
  max-width: 900px;
  margin: 100px auto 60px;
  padding: 40px 30px;
  color: var(--text-1);

  @media (max-width: 768px) {
    margin: 80px 16px 40px;
    padding: 24px 18px;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-3);
  border: var(--border);
  box-shadow: var(--box-shadow);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-1);
  padding: 8px 18px;
  border-radius: 999px;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.25s ease;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    color: var(--main-color);
    border-color: var(--main-color);
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 3px;
  }
`;

const ArticleTitle = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 16px;
  line-height: 1.3;
  color: var(--text-1);
`;

const ArticleMeta = styled.div`
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: var(--text-3);
  opacity: 0.7;
  margin-bottom: 24px;
`;

const ArticleTags = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
`;

const ArticleTagsLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-3);
  opacity: 0.8;
`;

const ArticleTagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ArticleTag = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-2);
  background: oklch(0 0 0 / 0);
  border: var(--border);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: var(--main-color);
    border-color: var(--main-color);
    color: var(--text-1);
    opacity: 1;
  }
`;

const ArticleSummary = styled.div`
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-2);
  border-left: 3px solid var(--main-color);
  padding-left: 16px;
  margin-bottom: 24px;
  opacity: 0.85;
`;

const ArticleCover = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: var(--card-radius);
  margin-bottom: 30px;
`;
