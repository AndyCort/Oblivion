import { useEffect, useRef, useState } from 'react';

// Helper to calculate luminance
function getLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Helper to calculate contrast ratio
function getContrastRatio(l1: number, l2: number) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Helper: RGB to OKLCH
function rgbToOklch(r: number, g: number, b: number) {
  const toLinear = (c: number) => {
    c /= 255;
    return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
  };
  let lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.hypot(a, b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return [L, C, H];
}

// Helper: OKLCH to RGB
function oklchToRgb(L: number, C: number, H: number) {
  const hRad = H * Math.PI / 180;
  const a = C * Math.cos(hRad);
  const b_ = C * Math.sin(hRad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b_;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b_;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b_;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  const toSrgb = (c: number) => {
    return c > 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
  };
  return [
    Math.max(0, Math.min(255, Math.round(toSrgb(lr) * 255))),
    Math.max(0, Math.min(255, Math.round(toSrgb(lg) * 255))),
    Math.max(0, Math.min(255, Math.round(toSrgb(lb) * 255)))
  ];
}

// Function to get the average color of an image URL
function getAverageColor(url: string): Promise<{ r: number; g: number; b: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;
        let count = 0;

        // Sample every 40th pixel to be faster (step by 4*40 = 160)
        for (let i = 0; i < data.length; i += 160) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        resolve({ r, g, b });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
  });
}

// Inject global styles once
function injectGlobalStyles() {
  if (typeof document === 'undefined') return;
  const styleId = 'auto-contrast-global-style';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    [data-auto-contrast="true"] {
      color: var(--auto-contrast, inherit) !important;
    }
    /* Force all children (except links and code) to use the contrast color or inherit */
    [data-auto-contrast="true"] *:not(a, code, pre) {
      color: var(--auto-contrast, inherit) !important;
    }
  `;
  document.head.appendChild(style);
}

export interface AutoContrastOptions {
  /**
   * Target contrast ratio to achieve (WCAG AA is 4.5, AAA is 7.0)
   */
  targetContrast?: number;
  /**
   * Optional custom image URL to calculate contrast against.
   * Useful for transparent components (like Navbar) that overlay an image but don't have a background-image themselves.
   */
  customImageUrl?: string;
  /**
   * Optional array of dependencies to trigger recalculation when they change (e.g., theme variable).
   */
  dependencies?: any[];
}

/**
 * Hook to automatically calculate and apply a high-contrast text color
 * based on the element's background image.
 */
export function useAutoContrast<T extends HTMLElement = HTMLElement>(
  { targetContrast = 6, customImageUrl, dependencies = [] }: AutoContrastOptions = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;

    // Ensure global styles are ready
    injectGlobalStyles();

    // Tag the element so global CSS applies
    element.setAttribute('data-auto-contrast', 'true');

    let textElement = element.querySelector('p, span, h1, h2, h3, h4, h5, h6') as HTMLElement;
    if (!textElement) textElement = element;

    const textComputedColor = window.getComputedStyle(textElement).color || 'rgb(0, 0, 0)';
    const textRgbMatch = textComputedColor.match(/\d+/g);
    let textR = 0, textG = 0, textB = 0;
    if (textRgbMatch && textRgbMatch.length >= 3) {
      textR = Number(textRgbMatch[0]);
      textG = Number(textRgbMatch[1]);
      textB = Number(textRgbMatch[2]);
    }
    const textLuminance = getLuminance(textR, textG, textB);

    let urlToFetch = customImageUrl;
    if (urlToFetch && urlToFetch.startsWith('var(')) {
      const varName = urlToFetch.match(/var\((.*?)\)/)?.[1]?.trim();
      if (varName) {
        urlToFetch = window.getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      }
    }

    if (!urlToFetch || urlToFetch === 'none') {
      // Helper to get elements up to a certain depth (BFS)
      const getElementsUpToDepth = (root: Element, maxDepth: number) => {
        let currentDepthElements = [root];
        const allElements = [root];
        
        for (let i = 0; i < maxDepth; i++) {
          let nextDepthElements: Element[] = [];
          for (const el of currentDepthElements) {
            const children = Array.from(el.children);
            nextDepthElements.push(...children);
            allElements.push(...children);
          }
          currentDepthElements = nextDepthElements;
          if (currentDepthElements.length === 0) break;
        }
        return allElements;
      };

      // Auto-detect background image from element, its children (up to depth 3)
      const elementsToCheck = getElementsUpToDepth(element, 3);

      for (const el of elementsToCheck) {
        // 1. Check if it's an <img> tag
        if (el.tagName.toLowerCase() === 'img') {
          const src = (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src;
          if (src) {
            urlToFetch = src;
            break;
          }
        }

        // 2. Check CSS backgrounds (including pseudo-elements)
        const pseudoElements = ['', '::before', '::after'];
        for (const pseudo of pseudoElements) {
          const style = window.getComputedStyle(el, pseudo || null);
          const bg = style.backgroundImage;
          if (bg && bg !== 'none') {
            const urlMatch = bg.match(/url\(['"]?(.*?)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
              urlToFetch = urlMatch[1];
              break;
            }
          }
        }
        if (urlToFetch && urlToFetch !== 'none') break;
      }
    } else {
      const urlMatch = urlToFetch.match(/url\(['"]?(.*?)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        urlToFetch = urlMatch[1];
      }
    }

    if (urlToFetch) {
      getAverageColor(urlToFetch).then(color => {
        element.style.setProperty('--auto-contrast-bg', `rgb(${color.r}, ${color.g}, ${color.b})`);
        const bgLuminance = getLuminance(color.r, color.g, color.b);
        const currentContrast = getContrastRatio(textLuminance, bgLuminance);

        if (currentContrast < targetContrast) {
          const whiteLuminance = getLuminance(255, 255, 255);
          const darkLuminance = getLuminance(26, 26, 26);
          const contrastWithWhite = getContrastRatio(whiteLuminance, bgLuminance);
          const contrastWithDark = getContrastRatio(bgLuminance, darkLuminance);

          let [L, C, H] = rgbToOklch(textR, textG, textB);
          let bestL = L;

          // Add a 1.5x bias towards white text.
          // WCAG 2.x math notoriously penalizes white text on medium gray backgrounds,
          // often suggesting dark gray when humans perceive white as much better.
          let finalC = C;
          if (contrastWithWhite * 1.5 > contrastWithDark) {
            for (let testL = L; testL <= 1; testL += 0.01) {
              // 提亮时略微降低饱和度，提亮幅度越大，饱和度越低
              const testC = C * Math.max(0, 1 - (testL - L) * 1.5);
              const [tr, tg, tb] = oklchToRgb(testL, testC, H);
              const tLum = getLuminance(tr, tg, tb);
              if (getContrastRatio(tLum, bgLuminance) >= targetContrast) {
                bestL = testL;
                finalC = testC;
                break;
              }
            }
            if (bestL === L) {
              bestL = 1;
              finalC = 0; // 纯白
            }
          } else {
            for (let testL = L; testL >= 0; testL -= 0.01) {
              const [tr, tg, tb] = oklchToRgb(testL, C, H);
              const tLum = getLuminance(tr, tg, tb);
              if (getContrastRatio(tLum, bgLuminance) >= targetContrast) {
                bestL = testL;
                break;
              }
            }
            if (bestL === L) bestL = 0;
          }

          const finalLStr = bestL.toFixed(4);
          const finalCStr = finalC.toFixed(4);
          const finalHStr = H.toFixed(2);
          const targetColor = `oklch(${finalLStr} ${finalCStr} ${finalHStr})`;

          // Apply the calculated color via CSS variable on the element itself
          element.style.setProperty('--auto-contrast', targetColor);
        }
      }).catch(err => console.error("Error calculating background color:", err));
    }
  }, [targetContrast, customImageUrl, ...dependencies]);

  return ref;
}
