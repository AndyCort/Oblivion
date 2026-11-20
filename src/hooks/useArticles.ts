import { fetchArticles, type Article } from '../api/articles';
import { createSharedResource } from './createSharedResource';

const articles = createSharedResource<Article[]>(() => fetchArticles(), []);

/** 文章列表、搜索与首页小组件共享同一次请求。 */
export function useArticles() {
  const { data, loading, error, retry } = articles.useResource();
  return { articles: data, loading, error, retry };
}
