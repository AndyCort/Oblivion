import React from "react";
import styled from "styled-components";
import MainLayout from "../layouts/MainLayout";
import Background from "../components/layout/Background";
import SideButton from "../components/layout/SideButton";
import { useLocale } from "../i18n/useLocale";
import { useCardStyle } from "../stores/themeStore";

export default function About() {
  const { cardStyle } = useCardStyle();
  const { locale, siteName } = useLocale();

  React.useEffect(() => {
    document.title = `${locale === "zh-CN" ? "关于" : "About"} — ${siteName}`;
  }, [siteName]);

  return (
    <MainLayout>
      <SideButton />
      <Background />

      <AboutPage>
        <div className="about-content" data-card={cardStyle}>
          <h1 className="about-title">
            {locale === "zh-CN" ? "关于" : "About"}
          </h1>
          <p className="about-bio">
            {locale === "zh-CN"
              ? `你好！我是个热爱探索与创造的开发者${siteName}。我是一个喜欢把自己并不存在的想法做出来的人。`
              : "Hello! "}
          </p>
        </div>
      </AboutPage>
    </MainLayout>
  );
}

const AboutPage = styled.main`
  padding: 120px 20px 60px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 10;

  .about-content {
    padding: 48px 40px;
    text-align: center;

    @media (max-width: 48rem) {
      padding: 32px 20px;
    }
  }

  .about-title {
    font-size: var(--text-page-title);
    font-family: var(--title-font);
    margin-bottom: 24px;
    background: linear-gradient(
      135deg,
      var(--main-color),
      oklch(0.645032 0.215403 16.439)
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: oklch(0 0 0 / 0);
    color: transparent;
    line-height: var(--leading-heading);

  }

  .about-bio {
    font-size: var(--text-reading);
    line-height: var(--leading-reading);
    color: var(--text-1);
    white-space: pre-wrap;

  }
`;
