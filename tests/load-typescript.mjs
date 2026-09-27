import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Use the project's compiler to test isolated TS modules without another test runtime.
export function moduleUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
}

export async function typescriptUrl(path, imports = {}) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  let { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  for (const [specifier, replacement] of Object.entries(imports)) {
    outputText = outputText.replaceAll(`'${specifier}'`, JSON.stringify(replacement));
  }
  return moduleUrl(outputText);
}
