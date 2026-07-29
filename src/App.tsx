import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { config } from './config';

import Home from './pages/Home';
import About from './pages/About';
import Articles from './pages/Articles';
import Search from './pages/Search';
import ArticleDetail from './pages/ArticleDetail';
import Moments from './pages/Moments';
{/*
const GlobalStyle = createGlobalStyle`
  :root {
    --main-color: ${config.theme.mainColor};
    --home-bg: ${config.light.homeBg};
    --home-bg-filter: ${config.light.homeBgFilter};
  }
  :root.dark-mode {
    --home-bg: ${config.dark.homeBg};
    --home-bg-filter: ${config.dark.homeBgFilter};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100dvh;
    font-family: var(--content-font);
    background-color: var(--bg-0);
  }

  *::-webkit-scrollbar {
    display: none;
  }

  i {
    font-size: 1.25rem;
  }

  p {
    color: var(--text-1);
    white-space: pre-wrap;
    margin: 5px 0;
  }
`;
*/}
export default function App() {
  React.useEffect(() => {
    document.documentElement.setAttribute('data-card', config.theme.cardStyle || 'glass');
  }, []);

  return (
    <>
      {/* <GlobalStyle />*/}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<Search />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        <Route path="/moment" element={<Moments />} />
      </Routes>
    </>
  );
}
