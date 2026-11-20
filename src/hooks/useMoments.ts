import { fetchMoments, type Moment } from '../api/moments';
import { createSharedResource } from './createSharedResource';

const moments = createSharedResource<Moment[]>(() => fetchMoments(), []);

export const refreshMoments = moments.refresh;

/** 动态时间线、统计、最新动态与日历共享同一次请求。 */
export function useMoments() {
  const { data, loading, error, retry } = moments.useResource();
  return { moments: data, loading, error, retry };
}
