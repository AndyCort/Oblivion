import React from "react";
import styled from "styled-components";
import "../styles/Home.css";
import MainLayout from "../layouts/MainLayout";
import Social from "../components/common/Social";
import ScrollArrow from "../components/home/ScrollArrow";
import Background from "../components/layout/Background";
import Quote from "../components/home/Quote";
import SideButton from "../components/layout/SideButton";
import Music from "../components/common/Music";
import Loader from "../components/common/Loader";
import { useLocale } from "../i18n/useLocale";
import { useCardStyle } from "../stores/themeStore";
import { CARD_STYLES } from "../config/theme";
import {
  SiteStats,
  LatestArticle,
  TagCloud,
  LatestMoment,
  MiniCalendar,
} from "../components/home/HomeWidgets";
import HomeJournal from "../components/home/HomeContent";

export default function Home() {
  const { locale } = useLocale();
  const { cardStyle } = useCardStyle();
  const title = locale === "zh-CN" ? "半生雨" : "Oblivion";

  React.useEffect(() => {
    document.title = title;
  }, [title]);

  const videoSrc = CARD_STYLES.find((s) => s.id === cardStyle)?.video ?? null;
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    const main = document.querySelector('main');
    if (!video || !main) return;

    const syncPlayback = () => {
      if (document.hidden || main.getBoundingClientRect().top <= window.innerHeight / 2) {
        video.pause();
      } else if (video.paused) {
        void video.play().catch(() => {});
      }
    };

    const observer = new IntersectionObserver(syncPlayback, {
      rootMargin: '0px 0px -50% 0px',
    });
    observer.observe(main);
    document.addEventListener('visibilitychange', syncPlayback);
    syncPlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      video.pause();
    };
  }, [videoSrc]);

  return (
    <MainLayout
      hero={
        <section className="home-section">
          <div className="home-bg" aria-hidden="true">
            {videoSrc && (
              <video
                key={videoSrc}
                ref={videoRef}
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
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
      }
    >
      <Loader />
      <SideButton />
      <Background />

      <Main className="main">
        <div className="grid">
          <div className="item1" data-card="glass">
            <SiteStats />
          </div>
          <div className="item2" data-card="glass">
            <LatestArticle />
          </div>
          <div className="item3" data-card="glass">
            <TagCloud />
          </div>
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
          <HomeJournal />
        </div>
      </Main>
    </MainLayout>
  );
}

const Main = styled.div`
  height: auto;
  position: relative;
  z-index: 1;
`;
