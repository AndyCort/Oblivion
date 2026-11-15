import { isValidElement, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import type { ComponentPropsWithoutRef } from "react";
import styled, { keyframes } from "styled-components";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/atom-one-dark.css";

import MainLayout from "../layouts/MainLayout";
import Background from "../components/layout/Background";
import SideButton from "../components/layout/SideButton";
import Toc from "../components/articles/Toc";

import "../styles/markdown.css";

import { fetchArticle, fetchArticles, type Article } from "../api/articles";
import { parseHeadings } from "../api/mdArticles";
import { getLocalizedField } from "../i18n/utils";
import { useLocale } from "../i18n/useLocale";
import { useCardStyle } from "../stores/themeStore";
import {
  Copy,
  Check,
  Calendar,
  Tags,
  User,
  ArrowLeft,
  Clock,
  BookOpen,
  Link2,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function extractCodeLanguage(children: ReactNode): string | null {
  if (!isValidElement<{ className?: string }>(children)) return null;
  const className = children.props?.className ?? "";
  const match = className.match(/language-([a-zA-Z0-9_+-]+)/);
  return match ? match[1].toUpperCase() : null;
}

function estimateReadingStats(text: string, chars?: number) {
  const charCount = chars ?? text.replace(/\s+/g, "").length;
  const minutes = Math.max(1, Math.round(charCount / 300));
  return { charCount, minutes };
}

const Pre = ({
  children,
  node: _node,
  ...props
}: ComponentPropsWithoutRef<"pre"> & ExtraProps) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
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
        console.error("Failed to copy text", err);
      }
    }
  };

  const language = extractCodeLanguage(children);

  return (
    <div className="code-block-wrapper">
      {language && <span className="code-lang-badge">{language}</span>}
      <button
        className={`copy-button ${copied ? "copied" : ""}`}
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

const Table = ({
  node: _node,
  ...props
}: ComponentPropsWithoutRef<"table"> & ExtraProps) => {
  const { locale } = useLocale();
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label={locale === "zh-CN" ? "文章表格" : "Article table"}
    >
      <table {...props} />
    </div>
  );
};

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { cardStyle } = useCardStyle();
  const { locale, siteName } = useLocale();

  const [article, setArticle] = useState<Article | null>(null);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const linkTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(linkTimer.current), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setArticle(null);
    if (slug) {
      fetchArticle(slug, controller.signal)
        .then((a) => {
          if (!controller.signal.aborted) setArticle(a);
        })
        .catch(() => {})
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();
    fetchArticles(controller.signal)
      .then((list) => {
        if (!controller.signal.aborted) setAllArticles(list);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!loading && !article && slug) {
      navigate("/articles");
    }
  }, [article, loading, slug, navigate]);

  // 注意：这个 effect 必须放在提前返回之前，否则 hook 数量在文章加载前后不一致会崩溃
  const titleText = article ? getLocalizedField(article.title, locale) : "";

  useEffect(() => {
    document.title = `${titleText || "文章"} — ${siteName}`;
  }, [titleText, siteName]);

  const { prevArticle, nextArticle } = useMemo(() => {
    if (!article || allArticles.length === 0) {
      return { prevArticle: null, nextArticle: null };
    }
    const idx = allArticles.findIndex(
      (item) => item.id === article.id || (slug && item.id === slug),
    );
    if (idx === -1) return { prevArticle: null, nextArticle: null };
    return {
      prevArticle: idx > 0 ? allArticles[idx - 1] : null,
      nextArticle: idx < allArticles.length - 1 ? allArticles[idx + 1] : null,
    };
  }, [allArticles, article, slug]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      clearTimeout(linkTimer.current);
      linkTimer.current = setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <MainLayout>
        <SideButton />
        <Background />
        <DetailArticle data-card={cardStyle} aria-busy="true">
          <SkeletonGroup>
            <SkeletonBlock style={{ width: "110px", height: "34px", borderRadius: "9999px", marginBottom: "24px" }} />
            <SkeletonBlock style={{ width: "78%", height: "38px", marginBottom: "18px" }} />
            <SkeletonBlock style={{ width: "48%", height: "20px", marginBottom: "24px" }} />
            <SkeletonBlock style={{ width: "100%", height: "84px", borderRadius: "12px", marginBottom: "28px" }} />
            <SkeletonBlock style={{ width: "100%", height: "260px", borderRadius: "var(--card-radius)", marginBottom: "30px" }} />
            <SkeletonBlock style={{ width: "100%", height: "18px", marginBottom: "12px" }} />
            <SkeletonBlock style={{ width: "92%", height: "18px", marginBottom: "12px" }} />
            <SkeletonBlock style={{ width: "85%", height: "18px", marginBottom: "12px" }} />
            <SkeletonBlock style={{ width: "68%", height: "18px" }} />
          </SkeletonGroup>
        </DetailArticle>
      </MainLayout>
    );
  }

  if (!article) return null;

  const summaryText = getLocalizedField(article.summary, locale);
  const contentText = article.content
    ? getLocalizedField(article.content, locale)
    : summaryText;
  const { charCount, minutes } = estimateReadingStats(
    typeof contentText === "string" ? contentText : "",
    article.chars,
  );

  const coverUrl = article.cover || article.featuredImage || "var(--home-bg)";

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

      <DetailArticle data-card={cardStyle}>
        <div className="article-top-bar">
          <Link to="/articles" className="back-button" data-button={cardStyle}>
            <ArrowLeft size={16} className="back-icon" />
            <span>{locale === "zh-CN" ? "返回列表" : "Back"}</span>
          </Link>

          <button
            type="button"
            className={`share-pill ${linkCopied ? "copied" : ""}`}
            onClick={handleCopyLink}
          >
            {linkCopied ? <Check size={14} /> : <Link2 size={14} />}
            <span>
              {linkCopied
                ? locale === "zh-CN"
                  ? "已复制链接"
                  : "Link copied"
                : locale === "zh-CN"
                  ? "复制链接"
                  : "Copy link"}
            </span>
          </button>
        </div>

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
          <span>
            <Clock size={14} />{" "}
            {locale === "zh-CN" ? `约 ${minutes} 分钟` : `${minutes} min read`}
          </span>
          {charCount > 0 && (
            <span>
              <BookOpen size={14} />{" "}
              {locale === "zh-CN"
                ? `${charCount.toLocaleString()} 字`
                : `${charCount.toLocaleString()} chars`}
            </span>
          )}
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="article-tags">
            <span className="tags-label">
              <Tags size={14} />
              {locale === "zh-CN" ? "标签" : "Tags"}
            </span>
            <div className="tags-list">
              {article.tags.map((tag, idx) => (
                <Link
                  key={`${tag}-${idx}`}
                  to={`/search?s=${encodeURIComponent(tag)}`}
                  className="article-tag"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {summaryText && article.content && (
          <div className="article-summary">
            <span className="summary-label">
              {locale === "zh-CN" ? "摘要" : "Summary"}
            </span>
            <p className="summary-text">{summaryText}</p>
          </div>
        )}

        {article.cover || article.featuredImage ? (
          <div className="article-cover-wrap">
            <img
              src={coverUrl}
              alt={titleText as string}
              className="article-cover"
            />
          </div>
        ) : null}

        <div className="article-body article-markdown-body">
          <div className="wmde-markdown">
            {article.Content ? (
              <article.Content />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
                components={{ pre: Pre, table: Table }}
              >
                {contentText as string}
              </ReactMarkdown>
            )}
          </div>
        </div>

        <footer className="article-footer">
          <div className="footer-divider">
            <span>END</span>
          </div>

          <div className="footer-actions">
            <button
              type="button"
              className={`footer-action-btn ${linkCopied ? "copied" : ""}`}
              onClick={handleCopyLink}
            >
              {linkCopied ? <Check size={15} /> : <Link2 size={15} />}
              <span>
                {linkCopied
                  ? locale === "zh-CN"
                    ? "已复制文章链接"
                    : "Link copied"
                  : locale === "zh-CN"
                    ? "分享 / 复制链接"
                    : "Copy article link"}
              </span>
            </button>

            <button
              type="button"
              className="footer-action-btn"
              onClick={handleScrollTop}
            >
              <ArrowUp size={15} />
              <span>{locale === "zh-CN" ? "回到顶部" : "Back to top"}</span>
            </button>
          </div>

          {(prevArticle || nextArticle) && (
            <nav
              className="article-pagination"
              aria-label={
                locale === "zh-CN" ? "相邻文章导航" : "Article navigation"
              }
            >
              {prevArticle ? (
                <Link
                  to={`/articles/${prevArticle.id}`}
                  className="pagination-card is-prev"
                >
                  <span className="pagination-dir">
                    <ChevronLeft size={14} />
                    {locale === "zh-CN" ? "上一篇" : "Previous"}
                  </span>
                  <span className="pagination-title">
                    {getLocalizedField(prevArticle.title, locale)}
                  </span>
                </Link>
              ) : (
                <div className="pagination-spacer" />
              )}

              {nextArticle ? (
                <Link
                  to={`/articles/${nextArticle.id}`}
                  className="pagination-card is-next"
                >
                  <span className="pagination-dir">
                    {locale === "zh-CN" ? "下一篇" : "Next"}
                    <ChevronRight size={14} />
                  </span>
                  <span className="pagination-title">
                    {getLocalizedField(nextArticle.title, locale)}
                  </span>
                </Link>
              ) : (
                <div className="pagination-spacer" />
              )}
            </nav>
          )}
        </footer>
      </DetailArticle>

      <Toc headings={headings} />
    </MainLayout>
  );
}

const skeletonPulse = keyframes`
  0%, 100% {
    opacity: 0.55;
  }
  50% {
    opacity: 0.9;
  }
`;

const SkeletonGroup = styled.div`
  width: 100%;
  max-width: var(--reading-width);
  margin-inline: auto;
`;

const SkeletonBlock = styled.div`
  background: var(--bg-2);
  border-radius: 10px;
  animation: ${skeletonPulse} 1.5s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const articleFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const DetailArticle = styled.article`
  width: var(--content-width);
  margin: 100px auto 60px;
  padding: 40px 30px;
  color: var(--text-1);
  animation: ${articleFadeIn} 0.35s ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 48rem) {
    margin: 80px 16px 40px;
    padding: 24px 18px;
  }

  .article-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 24px;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 8px 14px;
    border-radius: 9999px;
    text-decoration: none;
    font-size: var(--text-meta);
    color: var(--text-2);
    border: none;
    background: transparent;
    box-shadow: none;
    transition: color 0.2s ease, background-color 0.2s ease;

    .back-icon {
      transition: transform 0.2s ease;
    }

    &:hover {
      color: var(--main-color);
      background: color-mix(in oklab, var(--main-color) 8%, transparent);

      .back-icon {
        transform: translateX(-3px);
      }
    }
  }

  .share-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: var(--text-caption);
    color: var(--text-2);
    background: color-mix(in oklab, var(--text-1) 4%, transparent);
    border: var(--border);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: var(--main-color);
      border-color: var(--main-color);
    }

    &.copied {
      color: var(--on-main);
      background: var(--main-color);
      border-color: var(--main-color);
    }
  }

  .article-title {
    font-size: var(--text-page-title);
    margin-bottom: 16px;
    line-height: var(--leading-heading);
    letter-spacing: -0.015em;
    color: var(--text-1);
  }

  .article-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 18px;
    font-size: var(--text-meta);
    color: var(--text-3);
    margin-bottom: 22px;

    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }

  .article-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 24px;
  }

  .tags-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-meta);
    color: var(--text-3);
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .article-tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    font-size: var(--text-caption);
    font-weight: var(--weight-regular);
    max-width: 100%;
    overflow-wrap: anywhere;
    color: var(--text-2);
    background: color-mix(in oklab, var(--text-1) 4%, transparent);
    border: var(--border);
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.22s ease;

    &:hover {
      background: var(--main-color);
      border-color: var(--main-color);
      color: var(--on-main);
      transform: translateY(-1px);
    }
  }

  .article-summary {
    font-size: var(--text-body);
    line-height: var(--leading-body);
    color: var(--text-2);
    background: linear-gradient(
      135deg,
      color-mix(in oklab, var(--main-color) 9%, transparent),
      color-mix(in oklab, var(--bg-2) 60%, transparent)
    );
    border: var(--border);
    border-left: 4px solid var(--main-color);
    border-radius: 0 14px 14px 0;
    padding: 14px 18px;
    margin-bottom: 26px;

    .summary-label {
      display: inline-block;
      font-size: var(--text-caption);
      font-weight: var(--weight-strong);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--main-color);
      margin-bottom: 6px;
    }

    .summary-text {
      margin: 0;
      color: var(--text-2);
    }
  }

  .article-cover-wrap {
    width: 100%;
    max-width: var(--reading-width);
    margin: 0 auto 30px;
    border-radius: var(--card-radius);
    overflow: hidden;
    border: var(--border);
    background: var(--bg-2);
    box-shadow: 0 10px 28px oklch(0 0 0 / 0.1);
  }

  .article-cover {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    max-height: 420px;
    object-fit: cover;
  }

  .code-lang-badge {
    position: absolute;
    top: 10px;
    left: 72px;
    font-family: var(--font-code);
    font-size: 0.7rem;
    font-weight: var(--weight-strong);
    letter-spacing: 0.06em;
    color: var(--text-3);
    pointer-events: none;
    user-select: none;
    z-index: 2;
  }

  .article-footer {
    width: 100%;
    max-width: var(--reading-width);
    margin: 48px auto 0;
  }

  .footer-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
    color: var(--text-3);
    font-size: var(--text-caption);
    letter-spacing: 0.16em;

    &::before,
    &::after {
      content: "";
      flex: 1;
      height: 1px;
      background: linear-gradient(
        to right,
        transparent,
        color-mix(in oklab, var(--text-3) 30%, transparent),
        transparent
      );
    }
  }

  .footer-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 28px;
  }

  .footer-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 9999px;
    font-size: var(--text-meta);
    color: var(--text-2);
    background: color-mix(in oklab, var(--text-1) 4%, transparent);
    border: var(--border);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: var(--main-color);
      border-color: var(--main-color);
      transform: translateY(-1px);
    }

    &.copied {
      color: var(--on-main);
      background: var(--main-color);
      border-color: var(--main-color);
    }
  }

  .article-pagination {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;

    @media (max-width: 38rem) {
      grid-template-columns: 1fr;
    }
  }

  .pagination-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 14px 18px;
    border-radius: 16px;
    border: var(--border);
    background: color-mix(in oklab, var(--text-1) 3%, transparent);
    text-decoration: none;
    transition: all 0.22s ease;

    &.is-next {
      text-align: right;
      align-items: flex-end;
    }

    &:hover {
      border-color: var(--main-color);
      background: color-mix(in oklab, var(--main-color) 7%, transparent);
      transform: translateY(-2px);

      .pagination-title {
        color: var(--main-color);
      }
    }
  }

  .pagination-dir {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-caption);
    color: var(--text-3);
  }

  .pagination-title {
    font-size: var(--text-meta);
    font-weight: var(--weight-strong);
    color: var(--text-1);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.2s ease;
  }

  .article-top-bar,
  .article-title,
  .article-meta,
  .article-tags,
  .article-summary,
  .article-body {
    width: 100%;
    max-width: var(--reading-width);
    margin-inline: auto;
    overflow-wrap: anywhere;
  }
`;
