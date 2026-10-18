// Blog's NetEase playlist. Override these values in .env.local.
export const musicConfig = {
  api: import.meta.env.VITE_METING_API?.trim() || 'https://api.qijieya.cn/meting/',
  server: import.meta.env.VITE_METING_SERVER?.trim() || 'netease',
  playlistId: import.meta.env.VITE_METING_PLAYLIST_ID?.trim() || '2779302837',
};
