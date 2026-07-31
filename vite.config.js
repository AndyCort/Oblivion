import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import { themeConfig } from './src/config/theme.config';
var OUTPUT_PATH = './src/styles/theme-vars.css';
var toCssVar = function (key) { return "--".concat(key.replace(/([A-Z])/g, '-$1').toLowerCase()); };
var toCssBlock = function (selector, vars) {
    return "".concat(selector, " {\n").concat(Object.entries(vars)
        .map(function (_a) {
        var k = _a[0], v = _a[1];
        return (typeof v === 'string' ? "  ".concat(toCssVar(k), ": ").concat(v, ";") : null);
    })
        .filter(Boolean)
        .join('\n'), "\n}");
};
var toCardRulesBlock = function (styleId, cardCss) {
    return "html[data-card-style=\"".concat(styleId, "\"] :not(html)[data-card], :not(html)[data-card=\"").concat(styleId, "\"] {\n").concat(cardCss, "\n}");
};
function buildThemeCss() {
    var blocks = [
        '/* 自动生成的主题变量文件，请勿直接修改 (源自 theme.config.ts) */',
        '',
        toCssBlock(':root', themeConfig.light),
        '',
        toCssBlock(':root[data-theme="dark"], :root.dark-mode', themeConfig.dark),
        '',
    ];
    for (var _i = 0, _a = themeConfig.cardStyles; _i < _a.length; _i++) {
        var style = _a[_i];
        var vars = { mainColor: style.mainColor, homeBg: style.homeBg, footerBg: style.footerBg };
        blocks.push(toCssBlock("html[data-card-style=\"".concat(style.id, "\"]"), vars), '', toCardRulesBlock(style.id, style.cardCss), '');
    }
    return blocks.join('\n');
}
function writeThemeCss() {
    fs.writeFileSync(OUTPUT_PATH, buildThemeCss());
}
function generateThemeVars() {
    return {
        name: 'generate-theme-vars',
        buildStart: function () {
            writeThemeCss();
            console.log('✨ 已生成 src/styles/theme-vars.css');
        },
    };
}
export default defineConfig({
    plugins: [react(), generateThemeVars()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            }
        }
    }
});
