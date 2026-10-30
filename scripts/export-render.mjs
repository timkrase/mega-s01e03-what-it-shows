import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const route = 'kb/decisions/0002-dedupe-by-cause';
let html = await readFile(`build/${route}/index.html`, 'utf8');
const cssLinks = [...html.matchAll(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g)];
for (const [tag, href] of cssLinks) {
  const path = resolve(`build/${route}`, href);
  if (!path.startsWith(resolve('build') + '/')) throw new Error(`CSS outside build: ${href}`);
  html = html.replace(tag, `<style>${await readFile(path, 'utf8')}</style>`);
}
// Preserve the actual server-rendered document as a standalone reading copy.
// The full build retains hydration and the interactive explorer.
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
html = html.replace(/<link\b[^>]*rel="(?:modulepreload|preload)"[^>]*>/g, '');
await mkdir('rendered', { recursive: true });
await writeFile('rendered/4471-review.html', html);
console.log('Exported the real prerendered review with its compiled CSS.');
