import React from 'react';
import '../styles/Home.css';
import MainLayout from '../layouts/MainLayout';
import Social from '../components/Social';
import ScrollArrow from '../components/ScrollArrow';
import Background from '../components/Background';
import Quote from '../components/Quote';
import SideButton from '../components/SideButton';
import MusicIsland from '../components/MusicIsland';
import Loader from '../components/Loader';
import { getLocale } from '../i18n/utils';

export default function Home() {
  const locale = getLocale();
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

      <div className="home-main">
        <div className="sd">123</div>
      </div>
    </MainLayout>
  );
}
