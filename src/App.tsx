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

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: '50px', background: 'red', color: 'white' }}><pre>{this.state.error?.stack || this.state.error?.toString()}</pre></div>;
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
