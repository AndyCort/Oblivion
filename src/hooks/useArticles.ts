import { useEffect, useState } from 'react';
import { fetchArticles, type Article } from '../api/articles';

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchArticles(controller.signal)
      .then((list) => { if (!controller.signal.aborted) setArticles(list); })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.error('Unable to load articles', error);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return { articles, loading };
}
