import styled, { keyframes } from "styled-components";
import { useLocale } from "../../../i18n/useLocale";
import journalScene from "../../../assets/imgs/glass-footer.jpg";
import rainTexture from "../../../assets/home-bg.jpg";

/* ==========================================================================
   Keyframes
   ========================================================================== */

const pulseSeason = keyframes`
  0%, 100% {
    opacity: 0.6;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
`;

/* ==========================================================================
   Styled Components
   ========================================================================== */

const IntroHeader = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  align-items: center;
  gap: clamp(24px, 5vw, 64px);
  padding-top: clamp(24px, 4vw, 48px);
  padding-bottom: clamp(16px, 3vw, 24px);
  position: relative;

  /* 装饰性半透明环境辉光 */
  &::before {
    content: "";
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    width: clamp(260px, 50vw, 480px);
    height: clamp(140px, 30vw, 220px);
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--main-color) 12%, transparent) 0%,
      transparent 70%
    );
    pointer-events: none;
    z-index: -1;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  @media (max-width: 375px) {
    padding-top: 16px;
  }
`;

const JournalIntroCopy = styled.div`
  min-width: 0;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const JournalIntroMedia = styled.div`
  position: relative;
  min-width: 0;
  height: clamp(230px, 28vw, 330px);

  img {
    position: absolute;
    display: block;
    object-fit: cover;
    border: 1px solid color-mix(in srgb, var(--text-1) 18%, transparent);
    box-shadow: 0 14px 36px oklch(0 0 0 / 0.18);
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 270px;
  }

  @media (max-width: 375px) {
    height: 210px;
  }
`;

const JournalIntroScene = styled.img`
  top: 0;
  left: 0;
  width: 88%;
  height: 82%;
  border-radius: 18px;
  object-position: 78% center;
`;

const JournalIntroDetail = styled.img`
  right: 0;
  bottom: 0;
  width: 46%;
  height: 51%;
  border-radius: 14px;
  object-position: center;
`;

const JournalSeasonBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  color: var(--main-color);
  background: color-mix(in srgb, var(--bg-1) 85%, transparent);
  border: 1px solid color-mix(in srgb, var(--main-color) 25%, transparent);
  border-radius: 999px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 2px 10px color-mix(in srgb, var(--main-color) 8%, transparent);
  margin-bottom: 20px;
`;

const JournalSeasonDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--main-color);
  box-shadow: 0 0 8px var(--main-color);
  animation: ${pulseSeason} 3s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`;

const JournalMainTitle = styled.h2`
  font-family: var(--title-font);
  font-size: clamp(1.85rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--text-1);
  margin: 0 0 16px;
  text-shadow: 0 2px 12px color-mix(in srgb, var(--bg-0) 60%, transparent);

  @media (max-width: 375px) {
    font-size: 1.6rem;
  }
`;

const JournalLead = styled.p`
  font-family: var(--content-font);
  font-size: clamp(0.95rem, 1.8vw, 1.05rem);
  line-height: 1.85;
  color: var(--text-2);
  max-width: 640px;
  margin: 0;
  white-space: normal;
  text-wrap: balance;

  @media (max-width: 768px) {
    margin: 0 auto;
  }

  @media (max-width: 375px) {
    font-size: 0.9rem;
  }
`;

/* ==========================================================================
   Component
   ========================================================================== */

interface JournalIntroProps {
  seasonBadge: string;
}

export default function JournalIntro({ seasonBadge }: JournalIntroProps) {
  const { t } = useLocale();

  return (
    <IntroHeader aria-labelledby="journal-main-heading">
      <JournalIntroCopy>
        <JournalSeasonBadge aria-label={seasonBadge}>
          <JournalSeasonDot aria-hidden="true" />
          <span>{seasonBadge}</span>
        </JournalSeasonBadge>

        <JournalMainTitle id="journal-main-heading">
          {t("home.journal.title")}
        </JournalMainTitle>

        <JournalLead>{t("home.journal.lead")}</JournalLead>
      </JournalIntroCopy>
      <JournalIntroMedia aria-hidden="true">
        <JournalIntroScene src={journalScene} alt="" loading="lazy" />
        <JournalIntroDetail src={rainTexture} alt="" loading="lazy" />
      </JournalIntroMedia>
    </IntroHeader>
  );
}
