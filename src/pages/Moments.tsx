import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/Background';
import SideButton from '../components/SideButton';
import MusicIsland from '../components/MusicIsland';
import MomentList from '../components/MomentList';
import { getLocale } from '../i18n/utils';
// Note: using an import for JSON, Vite handles this nicely
import momentsData from '../data/moments.json';

export default function Moments() {
  const locale = getLocale();

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

      <MomentContainer>
        <MomentHeader>
          <MomentTitle>
            <i className="fas fa-camera-retro"></i>
            {locale === "zh-CN" ? "日常动态" : "Moments"}
          </MomentTitle>
          <MomentSubtitle>
            {descriptionText}
          </MomentSubtitle>
        </MomentHeader>

        <MomentList moments={momentsData} />
      </MomentContainer>
    </MainLayout>
  );
}

const MomentContainer = styled.div`
  padding: 120px 20px 80px;
  max-width: 720px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100svh;
  position: relative;
  z-index: 10;

  @media (max-width: 640px) {
    padding: 100px 16px 60px;
  }
`;

const MomentHeader = styled.header`
  text-align: center;
  margin-bottom: 48px;

  @media (max-width: 640px) {
    margin-bottom: 32px;
  }
`;

const MomentTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  font-family: var(--site-title-font);
  color: var(--main-color);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  i {
    font-size: 1.8rem;
    opacity: 0.9;
  }

  @media (max-width: 640px) {
    font-size: 1.8rem;
  }
`;

const MomentSubtitle = styled.p`
  font-size: 1.05rem;
  color: var(--frame-color);
  opacity: 0.85;
  font-family: var(--content-font);
  max-width: 500px;
  margin: 0 auto;
`;
