import { useEffect } from 'react';
import '../styles/Moments.css';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/layout/Background';
import SideButton from '../components/layout/SideButton';
import MomentList from '../components/moments/MomentList';
import { useLocale } from '../i18n/useLocale';
import { moments } from '../data/moments';
import { Camera } from 'lucide-react';

export default function Moments() {
  const { t } = useLocale();
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

        <MomentList moments={moments} />
      </div>
    </MainLayout>
  );
}
