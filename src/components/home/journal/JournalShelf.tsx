import styled from "styled-components";
import { Link } from "react-router-dom";
import { useLocale } from "../../../i18n/useLocale";
import { getLocalizedField } from "../../../i18n/utils";
import type { Article } from "../../../api/articles";
import {
  JournalSectionHeader,
  JournalSectionTag,
  JournalSectionTitle,
  JournalSectionDesc,
} from "./shared";

/* ==========================================================================
   Styled Components
   ========================================================================== */

const ShelfSection = styled.section``;

const JournalShelfList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 32px;
  border-top: 1px solid color-mix(in srgb, var(--text-2) 28%, transparent);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const JournalShelfItem = styled.article`
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: start;
  gap: 12px;
  min-width: 0;
  padding: 22px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-2) 28%, transparent);
`;

const JournalShelfNumber = styled.span`
  font-family: var(--title-font);
  font-size: 0.82rem;
  color: var(--main-color);
`;

const JournalShelfCopy = styled.div`
  min-width: 0;

  h4 {
    font-size: 1rem;
    line-height: 1.5;
    margin: 0 0 8px;

    a {
      color: var(--text-1);
      text-decoration: none;

      &:hover {
        color: var(--main-color);
      }
    }
  }

  p {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    white-space: normal;
    font-size: 0.86rem;
    line-height: 1.6;
    color: var(--text-2);
    margin: 0 0 10px;
  }

  time {
    font-size: 0.76rem;
    color: var(--text-3);
  }
`;

const JournalShelfCover = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;

  @media (max-width: 375px) {
    width: 64px;
    height: 64px;
  }
`;

/* ==========================================================================
   Component
   ========================================================================== */

interface JournalShelfProps {
  articles: Article[];
}

export default function JournalShelf({ articles }: JournalShelfProps) {
  const { locale, t } = useLocale();

  if (articles.length === 0) return null;

  return (
    <ShelfSection aria-labelledby="shelf-heading">
      <JournalSectionHeader>
        <JournalSectionTag>{t("home.journal.shelfTag")}</JournalSectionTag>
        <JournalSectionTitle id="shelf-heading">
          {t("home.journal.shelfTitle")}
        </JournalSectionTitle>
        <JournalSectionDesc>{t("home.journal.shelfDesc")}</JournalSectionDesc>
      </JournalSectionHeader>
      <JournalShelfList>
        {articles.map((article, index) => (
          <JournalShelfItem key={article.id}>
            <JournalShelfNumber aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </JournalShelfNumber>
            <JournalShelfCopy>
              <h4>
                <Link to={`/articles/${article.id}`}>
                  {getLocalizedField(article.title, locale)}
                </Link>
              </h4>
              {article.summary && (
                <p>{getLocalizedField(article.summary, locale)}</p>
              )}
              <time dateTime={article.date}>{article.date}</time>
            </JournalShelfCopy>
            {(article.cover || article.featuredImage) && (
              <JournalShelfCover
                src={article.cover || article.featuredImage}
                alt=""
                loading="lazy"
              />
            )}
          </JournalShelfItem>
        ))}
      </JournalShelfList>
    </ShelfSection>
  );
}
