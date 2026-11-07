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
  const { t, siteName } = useLocale();
  const { moments, loading, error, retry } = useMoments();
  const titleText = t('moments.title');

  useEffect(() => {
    document.title = `${titleText} — ${siteName}`;
  }, [titleText, siteName]);

  return (
    <MainLayout>
      <SideButton />
      <Background />

      <MomentsPage className="moments-page">
        <header className="moment-header">
          <h1 className="moment-title">
            <Camera className="moment-title-icon" size="1em" />
            {titleText}
          </h1>
          <p className="moment-subtitle">
            {t('moments.subtitle')}
          </p>
        </header>

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
      </MomentsPage>
    </MainLayout>
  );
}

const MomentsPage = styled.main`
  padding: 120px 20px 80px;
  max-width: 720px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100svh;
  position: relative;
  z-index: 10;

  @media (max-width: 40rem) {
    padding: 100px 16px 60px;
  }

  .moment-header {
    text-align: center;
    margin-bottom: 48px;

    @media (max-width: 40rem) {
      margin-bottom: 32px;
    }
  }

  .moment-title {
    font-size: var(--text-page-title);
    font-weight: var(--weight-strong);
    font-family: var(--title-font);
    color: var(--main-color);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    line-height: var(--leading-heading);
    overflow-wrap: anywhere;
  }

  .moment-title-icon {
    flex-shrink: 0;
    opacity: 0.9;
    color: var(--main-color);
  }

  .moment-subtitle {
    font-size: var(--text-body);
    color: var(--text-2);
    font-family: var(--content-font);
    max-width: 500px;
    margin: 0 auto;
  }
`;
