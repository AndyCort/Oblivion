import { useEffect } from 'react';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/layout/Background';
import SideButton from '../components/layout/SideButton';
import MomentList from '../components/moments/MomentList';
import { useLocale } from '../i18n/useLocale';
import { useMoments } from '../hooks/useMoments';
import { Camera } from 'lucide-react';

export default function Moments() {
  const { t } = useLocale();
  const { moments, loading, error, retry } = useMoments();
  const titleText = t('moments.title');

  useEffect(() => {
    document.title = `${titleText} — Oblivion`;
  }, [titleText]);

  return (
    <MainLayout>
      <SideButton />
      <Background />

      <MomentContainer>
        <MomentHeader>
          <MomentTitle>
            <MomentTitleIcon size="1em" />
            {titleText}
          </MomentTitle>
          <MomentSubtitle>
            {t('moments.subtitle')}
          </MomentSubtitle>
        </MomentHeader>

        {loading ? (
          <p role="status">{t('moments.loading')}</p>
        ) : error ? (
          <div role="alert">
            <p>{t('moments.failed')}</p>
            <button type="button" onClick={() => void retry()}>{t('moments.retry')}</button>
          </div>
        ) : (
          <MomentList moments={moments} />
        )}
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
  font-family: var(--title-font);
  color: var(--main-color);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  @media (max-width: 640px) {
    font-size: 1.8rem;
  }
`;

const MomentTitleIcon = styled(Camera)`
  font-size: 1.8rem;
  opacity: 0.9;
  color: var(--main-color);
`;

const MomentSubtitle = styled.p`
  font-size: 1.05rem;
  color: var(--text-2);
  font-family: var(--content-font);
  max-width: 500px;
  margin: 0 auto;
`;
