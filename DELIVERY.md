# S01E03: what it shows

Ticket #4471 combines two date defects. After deduplicating the export's overlapping rows,
the tenant-based classifier places 379 reports in the parser group and 33 in the booking-v3 hint group.

Read the [signed review source](src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx)
or its [standalone rendered reading copy](rendered/4471-review.html). The reading copy contains
the actual Svelte prerendered HTML and compiled CSS. Its tables, graph, and desk ref were produced
by the components. The full static site in `build/` also includes the working interactive explorer.

The original export files remain unchanged. The new review proposes replacing the old accepted
subject-only decision. It does not claim that the desk adopted the proposal or that production fixes shipped.
The data ends on 4 October 2026. The review date is 30 October 2026.

## Deliverables

- [Parser issue draft](tickets/parser.md), covering 379 report IDs.
- [Hint issue draft](tickets/hint.md), covering 33 report IDs.
- [Computed analysis](evidence/analysis.json), including complete report-ID membership and tenant records.
- [Desktop screenshot](evidence/review-desktop.png) and [phone screenshot](evidence/review-mobile.png).
- [Browser check](evidence/browser-check.json), including an actual hydrated explorer interaction.
- [Original export hashes](evidence/export-hashes.json), for checking that the original files were preserved.

The five desk-noted symptom anomalies remain inside the parser count. Their bodies are preserved in the
review and issue draft. They need follow-up evidence before anyone calls them a third cause.

## Rebuild and check

Use Node 22.12 or newer. In a fresh checkout, install the exact direct dependency versions in `package.json`:

```sh
npm install
npm run prepare-tickets
npm run build
npm run verify
```

For the browser check, use Playwright's Chromium browser. Serve the full static build in one terminal:

```sh
python3 -m http.server 8347 --bind 127.0.0.1 --directory build
```

Run the browser checks in another terminal:

```sh
npm run verify-browser
```

Open `http://127.0.0.1:8347/kb/decisions/0002-dedupe-by-cause/` for the interactive page.
The browser check verifies the two cause totals, generated desk ref, tenant-dependent merge decisions,
KB index entry, desktop layout, phone layout, and absence of JavaScript page errors.

This session reused Svelte, mdsvex, Vite, Zod, and Playwright already present on the student's machine.
The machine's Homebrew Node executable had a missing dynamic library. The build used the existing
Node 26.12.1 installation instead. No application was installed for this work.

The production parser and booking form are not included in the course export. The tickets' product
acceptance checks are proposed checks for engineering. The local verification proves the export analysis,
KB rendering, and explorer behavior.
