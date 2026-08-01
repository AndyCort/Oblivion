import React from 'react';
import '../styles/About.css';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/Background';
import SideButton from '../components/SideButton';
import { useLocale } from '../i18n/useLocale';

export default function About() {
  const { locale } = useLocale();
  const titleText = locale === "zh-CN" ? "关于我" : "About Me";
  const bioText =
    locale === "zh-CN"
      ? "你好！我是个热爱探索与创造的开发者。我是一个喜欢把自己并不存在的想法做出来的人。"
      : "Hello! I am a developer passionate about exploration and creation. I love combining elegant design with modern frontend technologies to create impressive digital experiences. Welcome to my digital garden.";

  React.useEffect(() => {
    document.title = `${titleText} — Oblivion`;
  }, [titleText]);

  return (
    <MainLayout>
      <SideButton />
      <Background />

      <div className="about-container">
        <div className="about-content" data-card="base">
          <h1 className="about-title">{titleText}</h1>
          <p className="about-bio">{bioText}</p>
        </div>
      </div>
    </MainLayout>
  );
}
