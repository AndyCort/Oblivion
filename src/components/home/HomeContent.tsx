import { useMemo } from "react";
import { useLocale } from "../../i18n/useLocale";
import { moments } from "../../data/moments";
import { useRemoteArticles } from "../../api/mdArticles";
import { MOCK_ARTICLES } from "../../api/articles";
import {
  ContentContainer,
  JournalIntro,
  JournalTimeline,
  JournalReading,
  JournalShelf,
  JournalTopics,
  JournalAfterword,
} from "./journal";

export { JournalAfterword } from "./journal";

/**
 * 根据当前时间和语系生成温和的节气/季节标语
 */
function getSeasonBadgeText(locale: string, t: (k: string) => string): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const isZh = locale === "zh-CN";

  let seasonKey = "autumn";
  if (month >= 3 && month <= 5) seasonKey = "spring";
  else if (month >= 6 && month <= 8) seasonKey = "summer";
  else if (month >= 9 && month <= 11) seasonKey = "autumn";
  else seasonKey = "winter";

  const seasonName = t(`home.journal.seasons.${seasonKey}`);

  const formattedMonth = Intl.DateTimeFormat(isZh ? "zh-CN" : "en-US", {
    year: "numeric",
    month: isZh ? "long" : "short",
  }).format(now);

  return `${formattedMonth} · ${seasonName}`;
}

export default function HomeJournal() {
  const { locale, t } = useLocale();

  // 获取手记（动态）：选取前 4 条
  const recentMoments = useMemo(() => {
    return moments.slice(0, 4);
  }, []);

  // 获取文章：优先远程 Worker，无网络或空时回退本地初始文章
  const mdArticles = useRemoteArticles();
  const allArticles = mdArticles.length > 0 ? mdArticles : MOCK_ARTICLES;

  // 优先让有真实封面的文章担任视觉主角，其余文章保持原有顺序。
  const featuredArticle =
    allArticles.find(
      (article) => article.pinned && (article.cover || article.featuredImage),
    ) ??
    [...allArticles]
      .filter((article) => article.cover || article.featuredImage)
      .sort((a, b) => b.date.localeCompare(a.date))[0] ??
    allArticles[0] ??
    null;

  const otherArticles = allArticles.filter(
    (article) => article.id !== featuredArticle?.id,
  );
  const secondaryArticles = otherArticles.slice(0, 2);
  const moreArticles = otherArticles.slice(2, 6);
  const afterwordArticles = otherArticles.slice(6, 9);

  // 将真实文章按主题组织成阅读入口，避免首页只是一串按时间排列的卡片。
  const topicRoutes = useMemo(() => {
    const groups = new Map<string, typeof allArticles>();
    for (const article of allArticles) {
      for (const tag of article.tags ?? []) {
        const name = tag.trim();
        if (!name) continue;
        groups.set(name, [...(groups.get(name) ?? []), article]);
      }
    }
    return [...groups.entries()]
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
      .slice(0, 3);
  }, [allArticles]);

  const seasonBadge = useMemo(() => getSeasonBadgeText(locale, t), [locale, t]);

  return (
    <ContentContainer id="home-journal">
      {/* 1. 开篇：「最近的日子」 */}
      <JournalIntro seasonBadge={seasonBadge} />

      {/* 2. 手记时间线 */}
      <JournalTimeline moments={recentMoments} />

      {/* 3. 延伸阅读 */}
      <JournalReading
        featuredArticle={featuredArticle}
        secondaryArticles={secondaryArticles}
      />

      {/* 4. 手记书架 */}
      {moreArticles.length > 0 && <JournalShelf articles={moreArticles} />}

      {/* 5. 视觉故事与后记 */}
      <JournalAfterword articles={afterwordArticles} />

      {/* 6. 主题阅读路线 */}
      {topicRoutes.length > 0 && <JournalTopics topicRoutes={topicRoutes} />}

      {/* 7. 收尾 */}
    </ContentContainer>
  );
}
