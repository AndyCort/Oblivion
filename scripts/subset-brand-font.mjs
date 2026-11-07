import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Run after changing siteConfig.name. The generated asset is checked in;
// normal development and production builds do not need Python/fontTools.
const siteSource = readFileSync(new URL('../src/config/site.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(siteSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { siteConfig } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const text = [...new Set(Object.values(siteConfig.name).join(''))].join('');
const source = fileURLToPath(new URL('../src/assets/fonts/TianTianQuan.ttf', import.meta.url));
const output = fileURLToPath(new URL('../src/assets/fonts/TianTianQuan-brand.woff2', import.meta.url));

execFileSync(process.env.FONTTOOLS_PYTHON || 'python3', [
  '-m', 'fontTools.subset', source,
  `--text=${text}`,
  `--output-file=${output}`,
  '--flavor=woff2',
  '--no-recalc-timestamp',
], { stdio: 'inherit' });
console.log(`Brand subset: ${text} (${statSync(output).size} bytes)`);
