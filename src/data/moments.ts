/**
 * 动态数据 —— 添加一条新动态，只需在下方数组里加一个 defineMoment({...}) 调用。
 *
 * 复制以下模板即可（可省略的字段已标注）：
 *
 * defineMoment({
 *   date: '2026-08-01 12:00',                    // 必填：时间（展示原样，同时用于自动生成 id）
 *   location: '杭州 · 咖啡馆',                    // 必填：地点
 *   content: {                                    // 必填：正文（双语）
 *     zh: '中文内容……',
 *     en: 'English content……',
 *   },
 *   mood: '☕ 专注',                               // 可选：心情标签（默认空）
 *   tags: ['前端', '随笔'],                        // 可选：标签（默认空数组）
 *   likes: 0,                                     // 可选：初始点赞数（默认 0）
 * })
 *
 * 优点：
 * - TypeScript 类型校验：必填项缺失 / 类型写错会直接编译报错
 * - 编辑器自动补全：字段名、双语 content 结构都有提示
 * - id 由 date 自动生成（相同 date 会报错提示），无需手动维护
 */

export type MomentContent = string | { zh: string; en: string };

export interface MomentInput {
  /** 必填：时间（展示原样） */
  date: string;
  /** 必填：地点 */
  location: string;
  /** 必填：正文（支持双语对象或纯字符串） */
  content: MomentContent;
  /** 可选：心情标签 */
  mood?: string;
  /** 可选：标签 */
  tags?: string[];
  /** 可选：初始点赞数 */
  likes?: number;
}

export interface Moment {
  id: string;
  date: string;
  location: string;
  content: MomentContent;
  mood: string;
  tags: string[];
  likes: number;
}

const usedIds = new Set<string>();

export function defineMoment(input: MomentInput): Moment {
  const id = `moment-${input.date.replace(/[^\d]/g, '')}`;
  if (usedIds.has(id)) {
    throw new Error(`重复的动态时间: ${input.date} (id: ${id})，请保证每条动态的 date 各不相同`);
  }
  usedIds.add(id);

  return {
    id,
    mood: input.mood ?? '',
    tags: input.tags ?? [],
    likes: input.likes ?? 0,
    ...input,
  };
}

export const moments: Moment[] = [
  defineMoment({
    date: '2026-07-26 14:30',
    location: '杭州 · 咖啡馆',
    mood: '☕ 专注',
    content: {
      zh: '在一个沉静的下午重新重构了导航栏和小屏幕响应式交互。写代码就像搭积木，不仅要追求逻辑的严密，更要追求极致的视觉与交互美感 ✨',
      en: 'Refactored the navbar and mobile responsive interaction on a quiet afternoon. Coding is like building with blocks—strive for both logical rigor and ultimate visual & interactive beauty ✨',
    },
    tags: ['前端', 'Astro', '设计'],
    likes: 1200000,
  }),
  defineMoment({
    date: '2026-07-20 22:15',
    location: '深夜的书房',
    mood: '🌙 随感',
    content: {
      zh: '"旷野般的人生，欣赏风景便好。" 很多事情不必过于纠结结果，沿途的体验与成长的痕迹本身就是最珍贵的财富。',
      en: "'Life is like a wilderness, just enjoy the scenery along the way.' Don't overthink outcomes; the experience and personal growth are the most precious treasures.",
    },
    tags: ['随笔', '生活'],
    likes: 28,
  }),
  defineMoment({
    date: '2026-07-15 09:00',
    location: '云端播放器',
    mood: '🎵 音乐',
    content: {
      zh: '最近循环播放了几首 Ambient / Lofi 曲目，能在繁杂的世界里找到片刻的安宁。强烈推荐给需要专注工作或清空大脑的朋友。',
      en: 'Been listening to Ambient / Lofi tracks on repeat lately. Finding a moment of tranquility in a noisy world. Highly recommended for focus or relaxation.',
    },
    tags: ['音乐推荐', 'Lofi'],
    likes: 19,
  }),
];
