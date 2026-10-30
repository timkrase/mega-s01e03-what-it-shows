import { mkdir, writeFile } from 'node:fs/promises';
import { withReview } from './load-review.mjs';

await withReview(async ({ review, locales }) => {
  await mkdir('tickets', { recursive: true });
  await mkdir('evidence', { recursive: true });
  const manifest = [];
  const descriptions = {
    parser: {
      title: 'Shared date parser swaps day and month for day-first tenants',
      resolution: 'The course engineering update reports #4471 closed on 5 October 2026. The parser is FIXED: fix(dates): parse dd/mm for eu locales. GitHub issue #1 is closed as completed. This is a course-reported production outcome, not a production test performed from this export.',
      example: 'R-41200',
      scope: 'Day-first tenants using app or email, plus booking-v2 form reports. App and email from booking-v3 tenants also use this path.',
      steps: [
        'Use Harbour Dental, whose tenant locale is en-GB and form version is booking-v2.',
        'Submit a date intended as 7 April 2026 through the shared parser as 07/04/2026.',
        'The desk documents the parser as month-first. R-41200 reports the reminder for 4 July instead.',
      ],
      expected: 'Preserve the tenant-intended date, 7 April 2026.',
      cause: 'The shared parser reads month first regardless of the tenant locale. booking-v2 prints DD/MM/YYYY, which agrees with day-first tenants, so its form reports belong to this parser problem.',
      fix: 'Parse using the tenant date convention or accept an explicit unambiguous representation. Do not infer the tenant convention from browserLocale or intakeTag.',
      acceptance: [
        'Round-trip 07/04/2026 as 7 April for a day-first tenant through app, email, and booking-v2 input.',
        'Check a day above 12, such as 23/04/2026, without a silent fallback or reversal.',
        'Check a month-first tenant as a control, and verify that a booking-v3 hint correction remains separate work.',
      ],
    },
    hint: {
      title: 'Booking-v3 date hint contradicts day-first tenant parsing',
      resolution: "The course engineering update reports #4471 closed on 5 October 2026. The hint issue is WON'T FIX because the booking-v3 form was retired. GitHub issue #2 is closed as not planned. Retirement is different from repairing the hint. The acceptance checks below record the investigation's original proposed fix criteria.",
      example: 'R-41230',
      scope: 'Form reports from Alder Physio, Copper Studio, and Pale Harbour, which run booking-v3 with day-first tenant locales. App and email reports from these tenants are excluded from this group.',
      steps: [
        'Use Copper Studio, whose tenant locale is es-ES and form version is booking-v3.',
        'Follow the displayed MM/DD/YYYY hint and enter 01/06/2026 for 6 January 2026.',
        'The form reads the tenant day-first convention, producing 1 June. R-41230 reports the client arriving on 1 June instead of 6 January.',
      ],
      expected: 'The displayed hint and the form reader agree, so following the hint preserves 6 January 2026.',
      cause: 'booking-v3 prints MM/DD/YYYY for a tenant whose form reads day first. The misleading hint makes a person supply the opposite order. This is separate from the shared parser always reading month first.',
      fix: 'Derive the form hint and interpretation from the same tenant locale. A shared-parser-only fix cannot correct the displayed hint.',
      acceptance: [
        'Check the hint and entered date together for de-DE, es-ES, and pt-PT booking-v3 tenants.',
        'Verify that a person following the hint for 6 January gets 6 January, including an ambiguous date.',
        'Check booking-v2 and a month-first tenant as controls. Keep app and email parser reports in their separate issue.',
      ],
    },
  };

  for (const group of review.groups) {
    const description = descriptions[group.cause];
    if (!description) throw new Error(`Unclassified cause: ${group.cause}`);
    const example = group.reports.find((r) => r.id === description.example);
    if (!example) throw new Error('Missing evidence report');
    const title = `${description.title} (${group.reports.length} reports from #4471)`;
    const channels = ['app', 'email', 'form'].map((c) => `${c}: ${group.reports.filter((r) => r.channel === c).length}`).join(', ');
    const lines = [
      `# ${description.title}`,
      '',
      `Covers **${group.reports.length} distinct reports** merged into source ticket #4471, from ${group.firstSeen} through ${group.lastSeen}.`,
      '',
      "This ticket records the MEGA.dev course support export and the course's later engineering update.",
      '',
      '## Course-reported resolution',
      '',
      description.resolution,
      '',
      'Source: [the current engineering update](https://hq.mega.dev/challenges/what-it-shows).',
      '',
      '## Scope and evidence',
      '',
      description.scope,
      '',
      `Channels: ${channels}. Affected tenants: ${group.tenants}.`,
      '',
      `Example ${example.id}, ${example.tenant}, ${example.channel}, received ${example.receivedAt}:`,
      '',
      `> ${example.body}`,
      '',
      '## Reproduction from the desk model',
      '',
      ...description.steps.map((step, i) => `${i + 1}. ${step}`),
      '',
      `Expected: ${description.expected}`,
      '',
      'The export includes the desk classifier and reports, not the production application. The date path above follows that model and the cited report. Engineering must reproduce it in the product.',
      '',
      '## Cause and proposed fix',
      '',
      description.cause,
      '',
      description.fix,
      '',
      '## Acceptance checks',
      '',
      ...description.acceptance.map((step) => `- [ ] ${step}`),
      '',
      '## How this count was obtained',
      '',
      `Deduplicate the export by report ID, filter mergedInto === 4471, and call causeOf with each report's channel and tenant record. This is the ${group.cause} group.`,
      '',
      `Intake guesses inside this group: parser ${group.taggedAs.parser ?? 0}, hint ${group.taggedAs.hint ?? 0}. Tags do not determine the cause.`,
      '',
      'Run `npm run prepare-tickets` to regenerate this draft and `npm run verify` to check the grouping and the rendered page. See [the signed review](https://github.com/timkrase/mega-s01e03-what-it-shows/blob/main/src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx) and [its rendered HTML](https://github.com/timkrase/mega-s01e03-what-it-shows/blob/main/rendered/4471-review.html).',
      '',
    ];
    if (group.cause === 'parser') {
      lines.push('### Symptom follow-up included in this count', '',
        `The ${review.notedReports.length} desk-noted reports ${review.notedReports.map((r) => r.id).join(', ')} remain included in the parser group under the supplied tenant classifier. Their unusual one-day or timing symptoms do not establish a third cause. Keep their bodies visible and obtain original date values and invite payloads before reclassifying.`, '');
    }
    lines.push('## Report IDs', '', '<details>', `<summary>${group.reports.length} distinct report IDs</summary>`, '', group.reports.map((r) => r.id).sort().join(', '), '', '</details>', '');
    await writeFile(`tickets/${group.cause}.md`, lines.join('\n'));
    manifest.push({ cause: group.cause, title, bodyFile: `tickets/${group.cause}.md`, count: group.reports.length });
  }

  const summary = {
    exportRows: review.exportedReports.length,
    uniqueReports: review.reports.length,
    repeatedRows: review.repeatedRows,
    mismatchedTags: review.mismatchedTags,
    groups: review.groups.map((g) => ({ ...g, reports: g.reports.map((r) => r.id).sort() })),
    notedReports: review.notedReports,
    tenants: locales.tenantHandles().map((tenant) => locales.tenantOf({ tenant })),
  };
  await writeFile('tickets/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  await writeFile('evidence/analysis.json', JSON.stringify(summary, null, 2) + '\n');
  console.log(`Prepared ${manifest.length} issue drafts covering ${review.reports.length} distinct reports.`);
});
