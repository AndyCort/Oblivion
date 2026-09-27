import styled from "styled-components";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLocale } from "../../../i18n/useLocale";
import { getLocalizedField } from "../../../i18n/utils";
import type { Article } from "../../../api/articles";
import rainTexture from "../../../assets/home-bg.jpg";
import {
  JournalSectionHeader,
  JournalSectionTag,
  JournalSectionTitle,
  JournalSectionDesc,
} from "./shared";

/* ==========================================================================
   Styled Components
   ========================================================================== */

const TopicsSection = styled.section``;

const JournalTopicKicker = styled.span`
  font-size: 0.74rem;
  color: var(--text-3);
  margin-bottom: 12px;
`;

const JournalTopicExample = styled.span`
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--text-2);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`;

const JournalTopicsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 375px) {
    grid-template-columns: 1fr;
  }
`;

const JournalTopic = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  min-height: 180px;
  padding: 22px;
  background: color-mix(in srgb, var(--bg-1) 78%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
  border-radius: 18px;
  color: var(--text-1);
  text-decoration: none;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: var(--main-color);
    transform: translateY(-2px);
  }

  strong {
    font-family: var(--title-font);
    font-size: 1.18rem;
    line-height: 1.35;
    margin-bottom: 8px;
    overflow-wrap: anywhere;
  }

  svg {
    color: var(--main-color);
    margin-top: auto;
    padding-top: 12px;
    box-sizing: content-box;
  }

  &:first-child {
    grid-row: span 2;
    min-height: 376px;
    justify-content: flex-end;
    background-image:
      linear-gradient(
        to top,
        oklch(0.08 0.01 260 / 0.94),
        oklch(0.08 0.01 260 / 0.2)
      ),
      url(${rainTexture});
    background-size: cover;
    background-position: center;
    color: white;

    ${JournalTopicKicker},
    .journal-topic-kicker {
      color: oklch(0.9 0 0);
    }

    ${JournalTopicExample},
    .journal-topic-example {
      color: oklch(0.9 0 0);
    }

    svg {
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      grid-column: 1 / -1;
      grid-row: auto;
      min-height: 210px;
    }
  }
`;

/* ==========================================================================
   Component
   ========================================================================== */

interface JournalTopicsProps {
  topicRoutes: [string, Article[]][];
}

export default function JournalTopics({ topicRoutes }: JournalTopicsProps) {
  const { locale, t } = useLocale();

  if (topicRoutes.length === 0) return null;

  return (
    <TopicsSection aria-labelledby="topics-heading">
      <JournalSectionHeader>
        <JournalSectionTag>{t("home.journal.topicsTag")}</JournalSectionTag>
        <JournalSectionTitle id="topics-heading">
          {t("home.journal.topicsTitle")}
        </JournalSectionTitle>
        <JournalSectionDesc>{t("home.journal.topicsDesc")}</JournalSectionDesc>
      </JournalSectionHeader>
      <JournalTopicsGrid>
        {topicRoutes.map(([tag, articles]) => (
          <JournalTopic
            key={tag}
            to={`/search?s=${encodeURIComponent(tag)}`}
          >
            <JournalTopicKicker>
              {t("home.journal.topicCount").replace(
                "{{count}}",
                String(articles.length),
              )}
            </JournalTopicKicker>
            <strong>{tag}</strong>
            <JournalTopicExample>
              {getLocalizedField(articles[0].title, locale)}
            </JournalTopicExample>
            <ArrowRight size={16} aria-hidden="true" />
          </JournalTopic>
        ))}
      </JournalTopicsGrid>
    </TopicsSection>
  );
}
