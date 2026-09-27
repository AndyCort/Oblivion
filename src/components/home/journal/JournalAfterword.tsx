import { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLocale } from "../../../i18n/useLocale";
import { getLocalizedField } from "../../../i18n/utils";
import type { Article } from "../../../api/articles";
import journalScene from "../../../assets/imgs/glass-footer.jpg";

/* ==========================================================================
   Styled Components
   ========================================================================== */

const Afterword = styled.section`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const AfterwordHeading = styled.header`
  span {
    color: var(--main-color);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.12em;
  }

  h3 {
    margin: 6px 0;
    color: var(--text-1);
    font-family: var(--title-font);
    font-size: clamp(1.35rem, 2.8vw, 1.7rem);
  }

  p {
    margin: 0;
    color: var(--text-3);
    font-size: 0.9rem;
    white-space: normal;
  }
`;

const AfterwordGrid = styled.div<{ $single: boolean }>`
  display: grid;
  grid-template-columns: ${({ $single }) =>
    $single ? "1fr" : "minmax(0, 1.2fr) minmax(0, 0.8fr)"};
  gap: 18px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const VisualStory = styled(Link)`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 330px;
  overflow: hidden;
  padding: 28px;
  border-radius: 20px;
  color: white;
  text-decoration: none;
  isolation: isolate;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
      to top,
      oklch(0.08 0.01 260 / 0.92),
      transparent 80%
    );
  }

  img {
    position: absolute;
    inset: 0;
    z-index: -2;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  &:hover img {
    transform: scale(1.035);
  }
  &:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 3px;
  }

  span {
    font-size: 0.8rem;
    opacity: 0.85;
  }

  h4 {
    max-width: 24ch;
    margin: 8px 0 10px;
    font-family: var(--title-font);
    font-size: clamp(1.3rem, 2.4vw, 1.8rem);
    line-height: 1.35;
  }

  p {
    max-width: 48ch;
    margin: 0 0 12px;
    color: oklch(0.9 0 0);
    font-size: 0.88rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    white-space: normal;
  }

  @media (max-width: 768px) {
    min-height: 300px;
    padding: 22px;
  }
  @media (prefers-reduced-motion: reduce) {
    img {
      transition: none;
    }
  }
`;

const MoreStories = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const StoryLine = styled(Link)`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-height: 145px;
  padding: 22px;
  border: var(--border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--bg-1) 78%, transparent);
  color: var(--text-1);
  text-decoration: none;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  &:hover {
    border-color: var(--main-color);
  }
  &:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 3px;
  }

  time {
    color: var(--text-3);
    font-size: 0.76rem;
  }
  h4 {
    margin: 10px 0;
    font-family: var(--title-font);
    font-size: 1.05rem;
    line-height: 1.45;
  }
  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--main-color);
    font-size: 0.8rem;
  }
`;

/* ==========================================================================
   Helper Subcomponent
   ========================================================================== */

function StoryImage({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <img
      src={!failed && src ? src : journalScene}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/* ==========================================================================
   Component
   ========================================================================== */

interface JournalAfterwordProps {
  articles: Article[];
}

export default function JournalAfterword({ articles }: JournalAfterwordProps) {
  const { locale, t } = useLocale();
  if (articles.length === 0) return null;

  const visualArticle =
    articles.find((article) => article.cover || article.featuredImage) ??
    articles[0];
  const otherArticles = articles
    .filter((article) => article.id !== visualArticle.id)
    .slice(0, 2);
  const title = getLocalizedField(visualArticle.title, locale);

  return (
    <Afterword aria-labelledby="journal-afterword-heading">
      <AfterwordHeading>
        <span>{t("home.journal.afterwordTag")}</span>
        <h3 id="journal-afterword-heading">
          {t("home.journal.afterwordTitle")}
        </h3>
        <p>{t("home.journal.afterwordDesc")}</p>
      </AfterwordHeading>
      <AfterwordGrid $single={otherArticles.length === 0}>
        <VisualStory to={`/articles/${visualArticle.id}`}>
          <StoryImage
            src={visualArticle.cover || visualArticle.featuredImage}
          />
          <span>{visualArticle.date}</span>
          <h4>{title}</h4>
          {visualArticle.summary && (
            <p>{getLocalizedField(visualArticle.summary, locale)}</p>
          )}
          <ArrowRight size={18} aria-hidden="true" />
        </VisualStory>
        {otherArticles.length > 0 && (
          <MoreStories>
            {otherArticles.map((article) => (
              <StoryLine to={`/articles/${article.id}`} key={article.id}>
                <time dateTime={article.date}>{article.date}</time>
                <h4>{getLocalizedField(article.title, locale)}</h4>
                <span>
                  {t("home.journal.readMore")}{" "}
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </StoryLine>
            ))}
          </MoreStories>
        )}
      </AfterwordGrid>
    </Afterword>
  );
}
