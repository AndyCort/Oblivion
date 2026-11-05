/// <reference types="vite/client" />

import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    /** 独立深浅模式 */
    'data-mode'?: 'light' | 'dark';
    /** 全局视觉主题预设 */
    'data-theme'?: 'glass' | 'base' | 'flat' | 'neo' | 'expressive' | string;
    /** 约定后代槽位 */
    'data-slot'?: string;
    /** 允许任意 data-组件类型="主题名" 属性，无需额外类名 */
    [key: `data-${string}`]:
      | 'glass'
      | 'base'
      | 'flat'
      | 'neo'
      | 'expressive'
      | 'light'
      | 'dark'
      | boolean
      | string
      | number
      | undefined;
  }
}
