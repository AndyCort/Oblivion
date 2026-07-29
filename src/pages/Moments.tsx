import React, { useEffect, useState } from 'react';
import '../styles/Moments.css';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/Background';
import SideButton from '../components/SideButton';
import MusicIsland from '../components/MusicIsland';
import MomentList from '../components/MomentList';
import { useLocale } from '../i18n/useLocale';
// Note: using an import for JSON, Vite handles this nicely
import momentsData from '../data/moments.json';
import { Camera } from 'lucide-react';

export default function Moments() {
  const { locale } = useLocale();

  const titleText = locale === "zh-CN" ? "动态 — 半生雨" : "Moments — Oblivion";
  const descriptionText =
    locale === "zh-CN"
      ? "记录日常的瞬间、思考、随感与生活点滴。"
      : "Capturing daily moments, thoughts, reflections, and snippets of life.";

  useEffect(() => {
    document.title = titleText;
  }, [titleText]);

  return (
    <MainLayout>
      <SideButton />
      <MusicIsland />
      <Background />

      <div className="moment-container">
        <header className="moment-header">
          <h1 className="moment-title">
            <Camera size="1em" className="moment-title-icon" />
            {locale === "zh-CN" ? "动态" : "Moments"}
          </h1>
          <p className="moment-subtitle">
            {descriptionText}
          </p>
        </header>

        <MomentList moments={momentsData} />
      </div>
    </MainLayout>
  );
}
