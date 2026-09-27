import styled from "styled-components";
import { Link } from "react-router-dom";

/* ==========================================================================
   Root Container (主容器排版)
   ========================================================================== */

export const ContentContainer = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 0 auto 100px;
  padding: 0 clamp(16px, 3vw, 28px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: clamp(48px, 6vw, 72px);
  position: relative;
  z-index: 2;
  color: var(--text-1);

  /* 统一键盘无障碍焦点态 */
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 3px;
    border-radius: 6px;
  }

  @media (max-width: 768px) {
    margin-bottom: 60px;
    gap: 40px;
  }

  @media (max-width: 375px) {
    padding: 0 12px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    * {
      transition: none !important;
      animation: none !important;
    }
  }
`;

/* ==========================================================================
   通用小节标题
   ========================================================================== */

export const JournalSectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;
`;

export const JournalSectionTag = styled.span`
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--main-color);
  font-weight: 600;
`;

export const JournalSectionTitle = styled.h3`
  font-family: var(--title-font);
  font-size: clamp(1.35rem, 2.8vw, 1.7rem);
  font-weight: 700;
  color: var(--text-1);
  margin: 0;
`;

export const JournalSectionDesc = styled.p`
  font-family: var(--content-font);
  font-size: 0.9rem;
  color: var(--text-3);
  margin: 0;
  white-space: normal;
`;

/* ==========================================================================
   通用操作跳转链接
   ========================================================================== */

export const JournalActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--main-color);
  padding: 8px 16px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-1) 75%, transparent);
  border: 1px solid color-mix(in srgb, var(--main-color) 22%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.25s ease;
  text-decoration: none;

  &:hover {
    background: color-mix(in srgb, var(--main-color) 12%, transparent);
    border-color: var(--main-color);
    transform: translateX(3px);
  }

  svg {
    transition: transform 0.25s ease;
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;
