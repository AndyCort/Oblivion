import styled, { css } from "styled-components";
import { Feather, ArrowRight } from "lucide-react";
import { useLocale } from "../../../i18n/useLocale";
import { getLocalizedField } from "../../../i18n/utils";
import type { Moment } from "../../../data/moments";
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

const TimelineSection = styled.section`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const JournalTimelineContainer = styled.div`
  position: relative;
  margin-top: 8px;
`;

const JournalTimelineSpine = styled.div`
  position: absolute;
  top: 16px;
  bottom: 24px;
  left: 140px;
  width: 1px;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--main-color) 40%, transparent),
    color-mix(in srgb, var(--border) 80%, transparent) 70%,
    transparent
  );
  pointer-events: none;

  @media (max-width: 768px) {
    left: 8px;
  }

  @media (max-width: 375px) {
    left: 4px;
  }
`;

const JournalTimelineList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 32px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const JournalTimelineItem = styled.li`
  display: grid;
  grid-template-columns: 140px 1px 1fr;
  align-items: start;
  gap: 0;
  position: relative;
  min-width: 0;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    padding-left: 28px;
    gap: 8px;
  }

  @media (max-width: 375px) {
    padding-left: 22px;
  }
`;

const JournalItemMeta = styled.div`
  padding-right: 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  gap: 6px;
  padding-top: 4px;

  @media (max-width: 768px) {
    padding-right: 0;
    align-items: center;
    text-align: left;
    flex-direction: row;
    gap: 10px;
    padding-top: 0;
  }
`;

const JournalItemDate = styled.time`
  font-family: var(--title-font);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-2);
  letter-spacing: 0.02em;
`;

const JournalItemTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px;

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

const JournalItemBadge = styled.span<{ $mood?: boolean }>`
  font-size: 0.72rem;
  padding: 2px 7px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--text-1) 6%, transparent);
  color: var(--text-3);
  white-space: nowrap;

  ${({ $mood }) =>
    $mood &&
    css`
      background: color-mix(in srgb, var(--main-color) 12%, transparent);
      color: var(--main-color);
    `}
`;

const JournalItemNodeCol = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    position: absolute;
    left: 4px;
    top: 0;
    height: auto;
  }

  @media (max-width: 375px) {
    left: 0px;
  }
`;

const JournalItemNode = styled.span`
  position: relative;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--bg-0);
  border: 2px solid var(--main-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--main-color) 16%, transparent);
  top: 9px;
  z-index: 1;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  ${JournalTimelineItem}:hover & {
    transform: scale(1.3);
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--main-color) 25%, transparent);
  }

  @media (max-width: 768px) {
    top: 4px;
  }
`;

const JournalItemContent = styled.article`
  padding-left: 28px;
  min-width: 0;

  @media (max-width: 768px) {
    padding-left: 0;
    width: 100%;
  }
`;

const JournalEntryCard = styled.div`
  background: color-mix(in srgb, var(--bg-1) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
  border-radius: 16px;
  padding: 18px 22px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--box-shadow);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--main-color) 35%, transparent);
    box-shadow: 0 10px 24px
      color-mix(in srgb, var(--main-color) 8%, transparent);
  }

  ${JournalTimelineItem}:first-child & {
    padding: 24px 28px;
    border-left: 3px solid var(--main-color);
  }

  ${JournalTimelineItem}:nth-child(even) & {
    border-radius: 6px 18px 18px 6px;
    border-left: 2px solid
      color-mix(in srgb, var(--main-color) 55%, transparent);
    background: color-mix(in srgb, var(--bg-1) 68%, transparent);
  }

  @media (max-width: 375px) {
    padding: 14px 16px;
  }
`;

const JournalEntryText = styled.p`
  font-family: var(--content-font);
  font-size: 0.98rem;
  line-height: 1.8;
  color: var(--text-1);
  margin: 0;
  white-space: normal;
  word-break: break-word;

  @media (max-width: 375px) {
    font-size: 0.92rem;
  }
`;

const JournalEntryMedia = styled.div`
  margin-top: 14px;
  border-radius: 10px;
  overflow: hidden;
  max-width: 380px;
  border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
`;

const JournalEntryImg = styled.img`
  width: 100%;
  height: auto;
  max-height: 240px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;

  ${JournalEntryMedia}:hover & {
    transform: scale(1.02);
  }
`;

const JournalMoreAction = styled.div`
  margin-top: 28px;
  display: flex;
  justify-content: flex-start;
  padding-left: 168px;

  @media (max-width: 768px) {
    padding-left: 28px;
  }
`;

/* ==========================================================================
   Component
   ========================================================================== */

interface JournalTimelineProps {
  moments: Moment[];
}

export default function JournalTimeline({ moments }: JournalTimelineProps) {
  const { locale, t } = useLocale();

  return (
    <TimelineSection aria-labelledby="timeline-heading">
      <JournalSectionHeader>
        <JournalSectionTag>
          <Feather size={12} style={{ display: "inline", marginRight: 4 }} />
          {t("home.journal.tag")}
        </JournalSectionTag>
        <JournalSectionTitle id="timeline-heading">
          {t("home.journal.timelineTitle")}
        </JournalSectionTitle>
        <JournalSectionDesc>
          {t("home.journal.timelineDesc")}
        </JournalSectionDesc>
      </JournalSectionHeader>

      <JournalTimelineContainer>
        <JournalTimelineSpine aria-hidden="true" />

        <JournalTimelineList>
          {moments.map((item) => {
            const content = getLocalizedField(item.content, locale);
            const mediaUrl =
              (item as any).image ||
              (Array.isArray((item as any).images) &&
              (item as any).images.length > 0
                ? (item as any).images[0]
                : null);

            return (
              <JournalTimelineItem key={item.id}>
                {/* 左侧元信息：时间与标签 */}
                <JournalItemMeta>
                  <JournalItemDate dateTime={item.date}>
                    {item.date.split(" ")[0]}
                  </JournalItemDate>
                  <JournalItemTags>
                    {item.mood && (
                      <JournalItemBadge $mood>{item.mood}</JournalItemBadge>
                    )}
                    {item.location && (
                      <JournalItemBadge>{item.location}</JournalItemBadge>
                    )}
                  </JournalItemTags>
                </JournalItemMeta>

                {/* 中间节点 */}
                <JournalItemNodeCol aria-hidden="true">
                  <JournalItemNode />
                </JournalItemNodeCol>

                {/* 右侧正文 */}
                <JournalItemContent>
                  <JournalEntryCard>
                    <JournalEntryText>{content}</JournalEntryText>

                    {mediaUrl && (
                      <JournalEntryMedia>
                        <JournalEntryImg
                          src={mediaUrl}
                          alt={content.slice(0, 20)}
                          loading="lazy"
                        />
                      </JournalEntryMedia>
                    )}
                  </JournalEntryCard>
                </JournalItemContent>
              </JournalTimelineItem>
            );
          })}
        </JournalTimelineList>
      </JournalTimelineContainer>

      {/* 前往动态页的明确入口 */}
      <JournalMoreAction>
        <JournalActionLink
          to="/moment"
          aria-label={t("home.journal.viewAllMoments")}
        >
          <span>{t("home.journal.viewAllMoments")}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </JournalActionLink>
      </JournalMoreAction>
    </TimelineSection>
  );
}
