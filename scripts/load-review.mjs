import { createServer } from 'vite';
import { resolve } from 'node:path';

export async function withReview(run) {
  const server = await createServer({
    configFile: false,
    root: resolve('.'),
    resolve: { alias: { '#lib': resolve('src/lib') } },
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  });
  try {
    const review = await server.ssrLoadModule('/src/lib/kb/review.ts');
    const causes = await server.ssrLoadModule('/src/lib/kb/causes.ts');
    const locales = await server.ssrLoadModule('/src/lib/kb/locales.ts');
    const cases = await server.ssrLoadModule('/src/lib/kb/dedupe-cases.ts');
    const stamp = await server.ssrLoadModule('/src/lib/kb/desk-ref.ts');
    return await run({ review, causes, locales, cases, stamp });
  } finally {
    await server.close();
  }
}
