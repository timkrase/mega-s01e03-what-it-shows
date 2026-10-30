import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { withReview } from './load-review.mjs';

await withReview(async ({ review, causes, locales, cases, stamp }) => {
  const exportHashes = JSON.parse(await readFile('evidence/export-hashes.json', 'utf8'));
  for (const [file, expectedHash] of Object.entries(exportHashes)) {
    assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'), expectedHash, `Original export changed: ${file}`);
  }
  assert.equal(review.exportedReports.length, 427);
  assert.equal(review.reports.length, 412);
  assert.equal(review.repeatedRows, 15);
  const first = new Map();
  for (const report of review.exportedReports) {
    if (first.has(report.id)) assert.deepEqual(report, first.get(report.id));
    else first.set(report.id, report);
  }
  assert.deepEqual(review.groups.map((g) => [g.cause, g.reports.length]), [['parser', 379], ['hint', 33]]);
  assert.equal(review.groups.reduce((n, g) => n + g.reports.length, 0), 412);
  assert.equal(new Set(review.groups.flatMap((g) => g.reports.map((r) => r.id))).size, 412);
  assert.equal(review.owner, 'parser');
  assert.equal(review.mismatchedTags, 38);
  assert.deepEqual(review.symptomNotes, [{ cause: 'parser', count: 5 }, { cause: 'hint', count: 0 }]);
  assert.equal(review.receivedThrough('2026-07-01'), 183);
  assert.equal(review.mergedOn('2026-07-02'), 184);
  assert.equal(review.lastReceived, '2026-10-04');
  assert.deepEqual(cases.DEDUPE_CASES.map((c) => causes.sameCause(c.a, locales.tenantOf(c.a), c.b, locales.tenantOf(c.b))), [true, false, false, true, false]);
  assert.equal(causes.causeOf({ channel: 'form' }, { handle: 'control', name: 'Control', locale: 'en-US', form: 'booking-v3' }), null);

  const page = await readFile('src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx', 'utf8');
  const signature = page.match(/^signature: '([^']+)'$/m)?.[1];
  assert.ok(signature);
  assert.match(page, /<RenderStamp \{signature\} \/>/);
  const html = await readFile('rendered/4471-review.html', 'utf8');
  const expectedRef = stamp.deskRef(signature);
  assert.ok(html.includes(expectedRef), `Missing rendered signature ${expectedRef}`);
  assert.match(html, /<strong>412<\/strong>/);
  assert.ok(/<td\b[^>]*><code>parser<\/code><\/td>\s*<td\b[^>]*>379<\/td>/.test(html), 'Rendered parser count must be 379');
  assert.ok(/<td\b[^>]*><code>hint<\/code><\/td>\s*<td\b[^>]*>33<\/td>/.test(html), 'Rendered hint count must be 33');
  for (const report of review.notedReports) assert.ok(html.includes(report.id));
  assert.ok(html.includes('different causes — keep apart'));
  assert.ok(html.includes('<svg'));
  assert.ok(html.includes('<style>'));
  assert.doesNotMatch(html, /<script\b/);
  const manifest = JSON.parse(await readFile('tickets/manifest.json', 'utf8'));
  assert.deepEqual(manifest.map((m) => [m.cause, m.count]), [['parser', 379], ['hint', 33]]);
  for (const group of review.groups) {
    const draft = await readFile(`tickets/${group.cause}.md`, 'utf8');
    for (const report of group.reports) assert.ok(draft.includes(report.id));
    assert.ok(draft.includes(`**${group.reports.length} distinct reports**`));
  }
  console.log(`Verified all 412 report IDs, 2 causes, 5 symptom notes, 5 dedupe cases, issue drafts, and rendered desk ref ${expectedRef}.`);
});
