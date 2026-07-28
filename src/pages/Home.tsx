import React from 'react';
import '../styles/Home.css';
import MainLayout from '../layouts/MainLayout';
import Social from '../components/Social';
import ScrollArrow from '../components/ScrollArrow';
import Background from '../components/Background';
import Quote from '../components/Quote';
import SideButton from '../components/SideButton';
import MusicIsland from '../components/MusicIsland';
import Music from '../components/Music'
import Loader from '../components/Loader';
import { useLocale } from '../i18n/useLocale';

export default function Home() {
  const { locale } = useLocale();
  const title = locale === "zh-CN" ? "半生雨" : "Oblivion";

  React.useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <MainLayout>
      <Loader />
      <SideButton />
      <MusicIsland />
      <Background />

      <section className="home-section">
        <div className="home-bg" />
        <div className="welcome-content">
          <Quote />
          <Social />
        </div>
        <ScrollArrow />
      </section>

      <div className="main">
        <div className="grid">
          <div className="item1" data-card="glass" data-hover>1</div>
          <div className="item2" data-card="glass" data-hover>2</div>
          <div className="item3" data-card="glass" data-hover>3</div>
          <div className="item4" data-card="glass" data-hover>
            落霞与孤鹜齐飞，秋水共长天一色
          </div>
          <div className="item5" data-card="glass" data-hover>
            <Music />
          </div>
          <div className="item6" data-card="glass" data-hover>6</div>
        </div>
      </div>
    </MainLayout>
  );
}
