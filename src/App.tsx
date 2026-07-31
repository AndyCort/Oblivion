import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import About from './pages/About';
import Articles from './pages/Articles';
import Search from './pages/Search';
import ArticleDetail from './pages/ArticleDetail';
import Moments from './pages/Moments';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/search" element={<Search />} />
      <Route path="/articles" element={<Articles />} />
      <Route path="/articles/:slug" element={<ArticleDetail />} />
      <Route path="/moment" element={<Moments />} />
    </Routes>
  );
}
