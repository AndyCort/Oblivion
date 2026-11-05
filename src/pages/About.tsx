import React from "react";
import styled from "styled-components";
import MainLayout from "../layouts/MainLayout";
import Background from "../components/layout/Background";
import SideButton from "../components/layout/SideButton";
import { useLocale } from "../i18n/useLocale";

export default function About() {
  const { locale, siteName } = useLocale();

  React.useEffect(() => {
    document.title = `${locale === "zh-CN" ? "关于" : "About"} — ${siteName}`;
  }, [siteName]);

  return (
    <MainLayout>
      <SideButton />
      <Background />

      <AboutPage>
        <div className="about-content" data-card>
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

    @media (max-width: 768px) {
      padding: 32px 20px;
    }
  }

  .about-title {
    font-size: 2.6rem;
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
    letter-spacing: -0.5px;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  .about-bio {
    font-size: 1.15rem;
    line-height: 1.8;
    color: var(--text-1);
    white-space: pre-wrap;

    @media (max-width: 768px) {
      font-size: 1.05rem;
    }
  }
`;
