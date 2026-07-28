export const config = {
  site: {
    title: "半生雨",
    description: "记录技术与生活",
    author: "Andy",
    url: "https://example.com",
    // 主题色
    mainColor: "oklch(0.7 0.175 10)",
  },

  nav: [
    {
      name: "home",
      href: "/",
    },
    {
      name: "articles",
      href: "/article",
    },
    {
      name: "about",
      href: "/about",
    },
    {
      name: "moment",
      href: "/moment",
    },
  ],

  theme: {
    mode: "auto",
    mainColor: "oklch(0.7 0.175 10)",
    primary: "oklch(0.7 0.15 350)",
    // 卡片样式: "glass" (毛玻璃/默认), "flat" (扁平化), "neo" (新拟态/粗边框)
    cardStyle: "",
  },

  blog: {
    postsPerPage: 10,
    showReadingTime: true,
    showToc: true,
  },

  footer: {
    text: "© 2026 半生雨",
  },
  // 浅色模式（默认）配置
  light: {

    // 首页背景图
    homeBg: "url('https://images.unsplash.com/photo-1587279535322-b20697908487')",
    // 首页背景图滤镜（例如遮罩）
    homeBgFilter: 'transparent',
  },

  // 深色模式配置
  dark: {

    // 首页背景图
    homeBg: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba')",
    // 首页背景图滤镜（例如遮罩：加深背景以适应深色模式文字）
    homeBgFilter: 'rgba(0, 0, 0, 0.6)',
  }
};
