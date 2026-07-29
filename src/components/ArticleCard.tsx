import React from 'react';
import styled from 'styled-components';
import { useLocale } from '../i18n/useLocale';
import { getLocalizedField } from '../i18n/utils';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface Props {
  title: any;
  summary?: any;
  date: string;
  tags?: string[];
  cover?: string;
  slug: string;
}

export default function ArticleCard({ title, summary, date, tags, cover, slug }: Props) {
  const { locale } = useLocale();
  const titleText = getLocalizedField(title, locale);
  const summaryText = getLocalizedField(summary, locale);

  const defaultCover = "--bg-color";
  const coverUrl = cover || defaultCover;

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
    <TiltWrapper data-tilt>
      <Card href={`/articles/${slug}`} data-card="base">
        <CardCover>
          <CoverImage style={{ backgroundImage: `url(${coverUrl})` }} />
          <MetaOverlay className="left">
            <MetaItem><Calendar size={12} />{formatDate(date)}</MetaItem>
          </MetaOverlay>
          <MetaOverlay className="right">
            <MetaItem><Clock size={12} />{getReadingTime()}</MetaItem>
          </MetaOverlay>
        </CardCover>
        <CardContent>
          <CardTitle>{titleText}</CardTitle>
          {summaryText && <CardSummary>{summaryText}</CardSummary>}
          {tags && tags.length > 0 && (
            <CardTags>
              {tags.slice(0, 5).map((tag, idx) => (
                <Tag key={idx}>{tag}</Tag>
              ))}
            </CardTags>
          )}
          <ReadMore>
            {locale === "zh-CN" ? "阅读更多" : "Read More"}
            <ArrowRight size={14} />
          </ReadMore>
        </CardContent>
      </Card>
    </TiltWrapper>
  );
}

// Styled Components

const TiltWrapper = styled.div`
  perspective: 2000px;
`;

const Card = styled.a`
  display: flex;
  flex-direction: row;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CardCover = styled.div`
  width: 320px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

const CoverImage = styled.div.attrs({ className: 'cover-image' })`
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`;

const MetaOverlay = styled.div`
  border-radius: 6px;
  margin: 30px;
  padding: 6px;
  color: var(--text-3);
  background-color: var(--bg-1);
  position: absolute;
  top: 0;

  &.left { left: 0; }
  &.right { right: 0; }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 4px 8px;
    margin: 8px;
  }
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  svg { width: 12px; height: 12px; }
`;

const CardContent = styled.div`
  padding: 24px 30px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  min-width: 0;

  @media (max-width: 768px) {
    padding: 20px;
    gap: 12px;
  }
`;

const CardTitle = styled.h3.attrs({ className: 'card-title' })`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-1);
  line-height: 1.4;
  margin: 0;
  transition: color 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const CardSummary = styled.p`
  font-size: 0.9rem;
  color: var(--text-3);
  opacity: 0.7;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const CardTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const Tag = styled.span`
  padding: 4px 12px;
  font-size: 0.75rem;
  background: var(--main-color);
  color: var(--text-1);
  border-radius: 12px;
  opacity: 0.85;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.05);
  }
`;

const ReadMore = styled.span.attrs({ className: 'read-more' })`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-1);
  opacity: 0.8;
  transition: all 0.2s;

  svg {
    transition: transform 0.2s;
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;
