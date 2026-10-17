import { useEffect } from 'react';
import '../styles/Moments.css';
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

      <div className="moment-container">
        <header className="moment-header">
          <h1 className="moment-title">
            <Camera size="1em" className="moment-title-icon" />
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
      </div>
    </MainLayout>
  );
}
