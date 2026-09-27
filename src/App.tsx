import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/style.css';
import { initTheme } from './stores/themeStore';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Articles = lazy(() => import('./pages/Articles'));
const Search = lazy(() => import('./pages/Search'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const Moments = lazy(() => import('./pages/Moments'));

initTheme();

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application render failed', error, info);
  }
  render() {
    if (this.state.hasError) {
      return <main role="alert" style={{ padding: '50px' }}>
        <p>页面加载失败，请刷新后重试。 / Unable to load this page.</p>
        <button onClick={() => window.location.reload()}>重新加载 / Reload</button>
      </main>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<Search />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        <Route path="/moment" element={<Moments />} />
      </Routes>
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
