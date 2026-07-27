import React from 'react';
import '../styles/About.css';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/Background';
import SideButton from '../components/SideButton';
import MusicIsland from '../components/MusicIsland';
import { getLocale } from '../i18n/utils';

export default function About() {
  const locale = getLocale();
  const titleText = locale === "zh-CN" ? "关于我" : "About Me";
  const bioText =
    locale === "zh-CN"
      ? "你好！我是个热爱探索与创造的开发者。我喜欢将优雅的设计和现代的前端技术相结合，创造令人印象深刻的数字体验。欢迎来到我的数字花园，在这里分享技术、生活与思考。"
      : "Hello! I am a developer passionate about exploration and creation. I love combining elegant design with modern frontend technologies to create impressive digital experiences. Welcome to my digital garden.";

  React.useEffect(() => {
    document.title = `${titleText} — Oblivion`;
  }, [titleText]);

  return (
    <MainLayout>
      <SideButton />
      <MusicIsland />
      <Background />

      <div className="about-container">
        <div className="about-content">
          <h1 className="about-title">{titleText}</h1>
          <p className="about-bio">{bioText}</p>
        </div>
      </div>
    </MainLayout>
  );
}
