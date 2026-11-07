import type { Article as ArticleData } from "../../api/articles";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useLocale } from "../../i18n/useLocale";
import { getLocalizedField } from "../../i18n/utils";
import { useCardStyle } from "../../stores/themeStore";
import { Calendar, Clock, ArrowRight, Pin, User } from "lucide-react";

interface Props {
  title: ArticleData["title"];
  summary?: ArticleData["summary"];
  author?: string;
  date: string;
  tags?: string[];
  cover?: string;
  slug: string;
  pinned?: boolean;
}

export default function ArticleCard({
  title,
  summary,
  author,
  date,
  tags,
  cover,
  slug,
  pinned,
}: Props) {
  const { cardStyle } = useCardStyle();
  const { locale } = useLocale();
  const titleText = getLocalizedField(title, locale);
  const summaryText = getLocalizedField(summary, locale);

  const coverUrl = cover || "var(--bg-color)";

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "zh-CN" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getReadingTime() {
    const textLength = summaryText?.length || 500;
    const time = Math.max(1, Math.ceil(textLength / 250));
    return locale === "zh-CN" ? `${time} 分钟阅读` : `${time} min read`;
  }

  return (
    <ArticleCardRoot className="article-card-tilt" data-tilt>
      <Link to={`/articles/${slug}`} className="article-card" data-card={cardStyle}>
        <div className="card-cover">
          <div
            className="cover-image"
            style={{
              backgroundImage: coverUrl.startsWith("var(")
                ? coverUrl
                : `url(${coverUrl})`,
            }}
          />
          <div className="meta-overlay left">
            <span className="meta-item">
              <Calendar size={12} />
              {formatDate(date)}
            </span>
          </div>
          <div className="meta-overlay right">
            <span className="meta-item">
              <Clock size={12} />
              {getReadingTime()}
            </span>
          </div>
        </div>
        <div className="card-content">
          <h3 className="card-title">
            {pinned && (
              <span
                style={{
                  color: "var(--main-color)",
                  marginRight: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <Pin size={18} />
              </span>
            )}
            {titleText}
          </h3>
          {summaryText && <p className="card-summary">{summaryText}</p>}
          {author && (
            <span className="card-author">
              <User size={12} /> {author}
            </span>
          )}
          {tags && tags.length > 0 && (
            <div className="card-tags">
              {tags.slice(0, 5).map((tag, idx) => (
                <span key={idx} className="card-tag">{tag}</span>
              ))}
            </div>
          )}
          <span className="read-more">
            {locale === "zh-CN" ? "阅读更多" : "Read More"}
            <ArrowRight size={14} />
          </span>
        </div>
      </Link>
    </ArticleCardRoot>
  );
}

// Scoped Styled Root
const ArticleCardRoot = styled.div`
  perspective: 2000px;
  container: article-card / inline-size;
  min-width: 0;

  .article-card {
    display: flex;
    flex-direction: row;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 220px;
    text-decoration: none;
    color: inherit;
    transform-style: preserve-3d;

    &:hover {
      transform: scale(1.02);

      .cover-image {
        transform: scale(1.1);
      }
      .read-more {
        color: var(--main-color);
        opacity: 1;
        svg {
          transform: translateX(6px);
        }
      }
      .card-title {
        color: var(--main-color);
      }
    }

    @container article-card (max-width: 48rem) {
      flex-direction: column;
    }
  }

  .card-cover {
    width: 36%;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;

    @container article-card (max-width: 48rem) {
      width: 100%;
      height: 200px;
    }
  }

  .cover-image {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .meta-overlay {
    border-radius: 6px;
    margin: 30px;
    padding: 6px;
    color: var(--text-2);
    background-color: var(--bg-3);
    position: absolute;
    top: 0;
    font-size: var(--text-meta);
    line-height: var(--leading-ui);
    max-width: calc(100% - 1rem);

    &.left {
      left: 0;
    }
    &.right {
      right: 0;
    }

    @container article-card (max-width: 48rem) {
      padding: 4px 8px;
      margin: 8px;
    }

    @container article-card (max-width: 30rem) {
      &.right { top: auto; bottom: 0; }
    }
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    svg {
      width: 12px;
      height: 12px;
    }
  }

  .card-content {
    padding: clamp(1rem, 3cqi, 2.25rem);
    container-type: inline-size;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 14px;
    min-width: 0;

    @container article-card (max-width: 48rem) {
      padding: 1.25rem;
      gap: 12px;
    }
  }

  .card-title {
    font-size: var(--text-card-title);
    font-weight: var(--weight-strong);
    color: var(--text-1);
    line-height: var(--leading-title);
    margin: 0;
    transition: color 0.4s ease;
    white-space: normal;
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;

  }

  .card-summary {
    font-size: var(--text-meta);
    color: var(--text-2);
    line-height: var(--leading-body);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: normal;

  }

  .card-author {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-meta);
    color: var(--text-3);
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;

    @media (max-width: 48rem) {
      gap: 6px;
    }
  }

  .card-tag {
    padding: 6px 14px;
    font-size: var(--text-caption);
    background: oklch(from var(--main-color) l c h / 0.1);
    color: oklch(from var(--main-color) l c h);
    border-radius: 100px;
    font-weight: var(--weight-regular);
    max-width: 100%;
    overflow-wrap: anywhere;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .read-more {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-meta);
    color: var(--text-1);
    transition: all 0.2s;

    svg {
      transition: transform 0.2s;
    }

  }
`;
