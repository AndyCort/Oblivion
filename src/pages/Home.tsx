import React from 'react';
import styled from 'styled-components';
import '../styles/Home.css';
import MainLayout from '../layouts/MainLayout';
import Social from '../components/Social';
import ScrollArrow from '../components/ScrollArrow';
import Background from '../components/Background';
import Quote from '../components/Quote';
import SideButton from '../components/SideButton';
import Music from '../components/Music';
import Loader from '../components/Loader';
import { useLocale } from '../i18n/useLocale';
import { useCardStyle } from '../stores/themeStore';
import { CARD_STYLES } from '../config/theme';
import {
  SiteStats,
  LatestArticle,
  TagCloud,
  LatestMoment,
  MiniCalendar,
  RandomPost,
  ArchiveList,
  Announcement,
} from '../components/HomeWidgets';

export default function Home() {
  const { locale } = useLocale();
  const title = locale === "zh-CN" ? "半生雨" : "Oblivion";
  const { cardStyle } = useCardStyle();

  React.useEffect(() => {
    document.title = title;
  }, [title]);

  // 每套风格的背景视频在 config/theme.config.ts 的 style.video 里配置
  const videoSrc = CARD_STYLES.find((s) => s.id === cardStyle)?.video ?? null;

  return (
    <MainLayout>
      <Loader />
      <SideButton />
      <Background />

      <section className="home-section">
        <div className={`home-bg ${videoSrc ? 'has-video' : ''}`}>
          {videoSrc && (
            <video
              key={videoSrc}
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="home-video"
            />
          )}
        </div>
        <div className="welcome-content">
          <Quote />
          <Social />
          <Music />
        </div>
        <ScrollArrow />
      </section>

      <Main className="main">
        <div className="grid">
          <div className="item1" data-card="glass"><SiteStats /></div>
          <div className="item2" data-card="glass"><LatestArticle /></div>
          <div className="item3" data-card="glass"><TagCloud /></div>
          <div className="item4" data-card="glass">
            落霞与孤鹜齐飞，秋水共长天一色
          </div>
          <div className="item5" data-card="glass">
            <LatestMoment />
          </div>
          <div className="item6" data-card="glass">
            <MiniCalendar />
          </div>
        </div>

        <div className="home-content">
          <div className="home-content-grid">
            <ArchiveList />
            <Announcement />
          </div>
          <RandomPost />
        </div>
      </Main>
    </MainLayout>
  );
}

const Main = styled.div`
  height:auto;
`;
