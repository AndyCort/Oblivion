import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { useLocale } from "../../../i18n/useLocale";
import { getLocalizedField } from "../../../i18n/utils";
import type { Article } from "../../../api/articles";
import {
  JournalSectionHeader,
  JournalSectionTag,
  JournalSectionTitle,
  JournalSectionDesc,
  JournalActionLink,
} from "./shared";

/* ==========================================================================
   Styled Components
   ========================================================================== */

const ReadingSection = styled.section`
  display: flex;
  flex-direction: column;
`;

const JournalArticlesLayout = styled.div<{ $single?: boolean }>`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  align-items: stretch;

  ${({ $single }) =>
    $single &&
    css`
      grid-template-columns: 1fr;
      max-width: 720px;
    `}

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const JournalFeaturedCard = styled.article`
  background: color-mix(in srgb, var(--bg-1) 85%, transparent);
  border: 1px solid color-mix(in srgb, var(--main-color) 25%, transparent);
  border-radius: 20px;
  padding: clamp(22px, 3vw, 32px);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8px 30px color-mix(in srgb, var(--main-color) 7%, transparent);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.3s ease,
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: -50px;
    right: -50px;
    width: 140px;
    height: 140px;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--main-color) 16%, transparent),
      transparent 70%
    );
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--main-color) 50%, transparent);
    box-shadow: 0 14px 36px
      color-mix(in srgb, var(--main-color) 12%, transparent);
  }

  @media (max-width: 375px) {
    padding: 16px;
  }
`;

const JournalFeaturedMedia = styled(Link)`
  display: block;
  height: 160px;
  margin-bottom: 20px;
  overflow: hidden;
  border-radius: 12px;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const JournalFeaturedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--main-color);
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 14px;
`;

const JournalFeaturedTitle = styled.h4`
  font-family: var(--title-font);
  font-size: clamp(1.2rem, 2.2vw, 1.45rem);
  font-weight: 700;
  line-height: 1.4;
  margin: 0 0 12px;

  a {
    color: var(--text-1);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--main-color);
    }
  }
`;

const JournalArticleMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--text-3);
  margin-bottom: 14px;
`;

const JournalArticleTags = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const JournalArticleTag = styled.span`
  color: var(--main-color);
  opacity: 0.85;
`;

const JournalFeaturedSummary = styled.p`
  font-family: var(--content-font);
  font-size: 0.92rem;
  line-height: 1.75;
  color: var(--text-2);
  margin: 0 0 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
`;

const JournalReadLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--main-color);
  text-decoration: none;
  align-self: flex-start;
  transition: gap 0.2s ease;

  &:hover {
    gap: 10px;
  }
`;

const JournalSecondaryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const JournalSecondaryCard = styled(Link)`
  background: color-mix(in srgb, var(--bg-1) 75%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
  border-radius: 16px;
  padding: 18px 20px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--main-color) 35%, transparent);
    box-shadow: 0 8px 20px color-mix(in srgb, var(--main-color) 8%, transparent);
  }
`;

const JournalSecondaryTitle = styled.h4`
  font-family: var(--title-font);
  font-size: 1.02rem;
  font-weight: 600;
  line-height: 1.45;
  color: var(--text-1);
  margin: 0;
  transition: color 0.2s ease;

  ${JournalSecondaryCard}:hover & {
    color: var(--main-color);
  }
`;

const JournalSecondarySummary = styled.p`
  font-family: var(--content-font);
  font-size: 0.86rem;
  line-height: 1.65;
  color: var(--text-2);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
`;

const JournalSecondaryFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 0.78rem;
  color: var(--text-3);
`;

const JournalReadingAllAction = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

const JournalEmptyBox = styled.div`
  padding: 40px 24px;
  text-align: center;
  background: color-mix(in srgb, var(--bg-1) 70%, transparent);
  border: 1px dashed color-mix(in srgb, var(--border) 80%, transparent);
  border-radius: 16px;
  color: var(--text-3);
  font-size: 0.95rem;
`;

/* ==========================================================================
   Component
   ========================================================================== */

interface JournalReadingProps {
  featuredArticle: Article | null;
  secondaryArticles: Article[];
}

export default function JournalReading({
  featuredArticle,
  secondaryArticles,
}: JournalReadingProps) {
  const { locale, t } = useLocale();

  return (
    <ReadingSection aria-labelledby="reading-heading">
      <JournalSectionHeader>
        <JournalSectionTag>
          <BookOpen size={12} style={{ display: "inline", marginRight: 4 }} />
          {t("nav.articles")}
        </JournalSectionTag>
        <JournalSectionTitle id="reading-heading">
          {t("home.journal.readingTitle")}
        </JournalSectionTitle>
        <JournalSectionDesc>
          {t("home.journal.readingDesc")}
        </JournalSectionDesc>
      </JournalSectionHeader>

      {!featuredArticle ? (
        <JournalEmptyBox>
          <p>{t("home.journal.noArticles")}</p>
        </JournalEmptyBox>
      ) : (
        <JournalArticlesLayout $single={secondaryArticles.length === 0}>
          {/* 1 篇重点文章 */}
          <JournalFeaturedCard>
            {(featuredArticle.cover || featuredArticle.featuredImage) && (
              <JournalFeaturedMedia
                to={`/articles/${featuredArticle.id}`}
                aria-label={getLocalizedField(featuredArticle.title, locale)}
              >
                <img
                  src={featuredArticle.cover || featuredArticle.featuredImage}
                  alt=""
                  loading="lazy"
                />
              </JournalFeaturedMedia>
            )}
            <div>
              <JournalFeaturedBadge>
                <Sparkles size={11} aria-hidden="true" />
                {t("home.journal.featuredBadge")}
              </JournalFeaturedBadge>

              <JournalFeaturedTitle>
                <Link to={`/articles/${featuredArticle.id}`}>
                  {getLocalizedField(featuredArticle.title, locale)}
                </Link>
              </JournalFeaturedTitle>

              <JournalArticleMeta>
                <time dateTime={featuredArticle.date}>
                  {featuredArticle.date}
                </time>
                {featuredArticle.tags && featuredArticle.tags.length > 0 && (
                  <JournalArticleTags>
                    {featuredArticle.tags.slice(0, 3).map((tag) => (
                      <JournalArticleTag key={tag}>#{tag}</JournalArticleTag>
                    ))}
                  </JournalArticleTags>
                )}
              </JournalArticleMeta>

              <JournalFeaturedSummary>
                {getLocalizedField(featuredArticle.summary, locale) || ""}
              </JournalFeaturedSummary>
            </div>

            <JournalReadLink
              to={`/articles/${featuredArticle.id}`}
              aria-label={`${t("home.journal.readMore")}: ${getLocalizedField(
                featuredArticle.title,
                locale,
              )}`}
            >
              <span>{t("home.journal.readMore")}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </JournalReadLink>
          </JournalFeaturedCard>

          {/* 最多 2 篇次要文章 */}
          {secondaryArticles.length > 0 && (
            <JournalSecondaryList>
              {secondaryArticles.map((article) => (
                <article key={article.id}>
                  <JournalSecondaryCard to={`/articles/${article.id}`}>
                    <JournalSecondaryTitle>
                      {getLocalizedField(article.title, locale)}
                    </JournalSecondaryTitle>

                    <JournalSecondarySummary>
                      {getLocalizedField(article.summary, locale) || ""}
                    </JournalSecondarySummary>

                    <JournalSecondaryFooter>
                      <time dateTime={article.date}>{article.date}</time>
                      {article.tags?.[0] && (
                        <JournalArticleTag>
                          #{article.tags[0]}
                        </JournalArticleTag>
                      )}
                    </JournalSecondaryFooter>
                  </JournalSecondaryCard>
                </article>
              ))}
            </JournalSecondaryList>
          )}
        </JournalArticlesLayout>
      )}

      <JournalReadingAllAction>
        <JournalActionLink
          to="/articles"
          aria-label={t("home.journal.moreArticles")}
        >
          <span>{t("home.journal.moreArticles")}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </JournalActionLink>
      </JournalReadingAllAction>
    </ReadingSection>
  );
}
