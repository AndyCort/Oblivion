import React, { useEffect, useRef, useState } from 'react';
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
import Toc from '../components/Toc';

import '../styles/ArticleDetail.css';
import '../styles/markdown.css';

import { fetchArticle, type Article } from '../api/articles';
import { parseHeadings } from '../api/mdArticles';
import { getLocalizedField } from '../i18n/utils';
import { useLocale } from '../i18n/useLocale';
import { Copy, Check, Calendar, Tags, User } from 'lucide-react';

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

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setArticle(null);
    if (slug) {
      fetchArticle(slug)
        .then((a) => { if (!cancelled) setArticle(a); })
        .catch(() => {})
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      setLoading(false);
    }
    return () => { cancelled = true; };
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

      <article className="article-detail-container" data-card="base">
        <Link className="back-button" to="/articles">
          ← {locale === "zh-CN" ? "返回列表" : "Back"}
        </Link>

        <h1 className="article-title">{titleText}</h1>

        <div className="article-meta">
          {article.author && (
            <span>
              <User size={14} /> {article.author}
            </span>
          )}
          <span>
            <Calendar size={14} /> {article.date}
          </span>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="article-tags">
            <span className="article-tags-label">
              <Tags size={14} />
              {locale === "zh-CN" ? "标签" : "Tags"}
            </span>
            <div className="article-tags-list">
              {article.tags.map((tag, idx) => (
                <Link
                  key={`${tag}-${idx}`}
                  className="article-tag"
                  to={`/search?s=${encodeURIComponent(tag)}`}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {summaryText && article.content && (
          <div className="article-summary">{summaryText}</div>
        )}

        {article.cover || article.featuredImage ? (
          <img className="article-cover" src={coverUrl} alt={titleText as string} />
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
      </article>

      <Toc headings={headings} />
    </MainLayout>
  );
}
