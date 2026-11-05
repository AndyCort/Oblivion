/**
 * 站点全局基础配置
 * 统一管理站点名称、描述、作者信息、社交外链、版权声明与页脚徽章
 */

export interface BadgeItem {
  label: string;
  labelBg?: string;
  value: string;
  valueBg?: string;
  valueColor?: string;
  url?: string;
}

export interface SiteConfig {
  /** 站点名称（支持中英文多语言） */
  name: {
    zh: string;
    en: string;
  };
  /** 站点副标题 / 描述 */
  description: {
    zh: string;
    en: string;
  };
  /** 站长 / 作者信息 */
  author: {
    name: string;
    avatar?: string;
    bio?: {
      zh: string;
      en: string;
    };
  };
  /** 版权信息 */
  copyright: {
    startYear: number;
    owner: string;
    license: string;
    licenseUrl: string;
  };
  /** 社交媒体外链 */
  social: {
    github?: string;
    twitter?: string;
    whatsapp?: string;
    telegram?: string;
    email?: string;
  };
  /** 页脚展示徽章 */
  badges: BadgeItem[];
}

export const siteConfig: SiteConfig = {
  name: {
    zh: "忘川",
    en: "Oblivion",
  },
  description: {
    zh: "忘川一梦，天地逍遥。",
    en: "Oblivion is a dream.",
  },
  author: {
    name: "Anlyn",
    bio: {
      zh: "你好！欢迎来到${siteName}。",
      en: "Hello! I am a developer passionate about exploration and creation. I love combining elegant design with modern frontend technologies to create impressive digital experiences. Welcome to my digital garden.",
    },
  },
  copyright: {
    startYear: 2001,
    owner: "Oblivion",
    license: "BY-NC-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },
  social: {
    github: "https://github.com",
    twitter: "https://twitter.com",
    whatsapp: "https://wa.me/Anlynovo",
    telegram: "https://t.me/Anyaovo",
  },
  badges: [
    {
      label: "野ICP备",
      labelBg: "oklch(0.6 0 0)",
      value: "1145141919810号",
      valueBg: "oklch(0.95 0.045 156)",
      valueColor: "oklch(0.4 0.09 152)",
      url: "/",
    },
    {
      label: "Theme",
      labelBg: "oklch(0.6 0 0)",
      value: "Oblivion",
      valueBg: "oklch(0.95 0.03 12.6)",
      valueColor: "oklch(41.03% 0.1502 10.3)",
      url: "/",
    },
    {
      label: "Frame",
      labelBg: "oklch(0.6 0 0)",
      value: "React",
      valueBg: "oklch(0.956262 0.044329 203.388)",
      valueColor: "oklch(0.398206 0.06641 227.392)",
      url: "https://react.dev/",
    },
    {
      label: "CDN",
      labelBg: "oklch(0.6 0 0)",
      value: "Cloudflare",
      valueBg: "oklch(0.95 0.16 73)",
      valueColor: "oklch(0.490423 0.148682 37.432)",
      url: "https://www.cloudflare.com",
    },
    {
      label: "Copyright",
      labelBg: "oklch(0.6 0 0)",
      value: "BY-NC-SA 4.0",
      valueBg: "oklch(0.943348 0.028406 294.588)",
      valueColor: "oklch(0.379642 0.178305 293.745)",
      url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    },
  ],
};

/**
 * 获取站点名称（优先读取全局环境注入，兜底读取 siteConfig）
 */
export function getSiteName(locale?: "zh-CN" | "en-US"): string {
  const isZh = (locale || "zh-CN") === "zh-CN";
  if (typeof window !== "undefined") {
    const globalEnv = (window as any).__GLOBAL_ENV__;
    if (isZh && globalEnv?.VITE_SITE_NAME) {
      return globalEnv.VITE_SITE_NAME;
    }
    if (!isZh && globalEnv?.VITE_SITE_NAME_EN) {
      return globalEnv.VITE_SITE_NAME_EN;
    }
  }
  return isZh ? siteConfig.name.zh : siteConfig.name.en;
}
