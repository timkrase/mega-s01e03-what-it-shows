# Booking-v3 date hint contradicts day-first tenant parsing

Covers **33 distinct reports** merged into source ticket #4471, from 2026-04-17 through 2026-09-22.

This is a defect ticket derived from the MEGA.dev course support export. It is not a claim that a production fix was shipped.

## Scope and evidence

Form reports from Alder Physio, Copper Studio, and Pale Harbour, which run booking-v3 with day-first tenant locales. App and email reports from these tenants are excluded from this group.

Channels: app: 0, email: 0, form: 33. Affected tenants: 3.

Example R-41230, copper.studio, form, received 2026-04-17T22:44:00+02:00:

> My client came on 1 June instead of 6 January. We sorted it out.

## Reproduction from the desk model

1. Use Copper Studio, whose tenant locale is es-ES and form version is booking-v3.
2. Follow the displayed MM/DD/YYYY hint and enter 01/06/2026 for 6 January 2026.
3. The form reads the tenant day-first convention, producing 1 June. R-41230 reports the client arriving on 1 June instead of 6 January.

Expected: The displayed hint and the form reader agree, so following the hint preserves 6 January 2026.

The export includes the desk classifier and reports, not the production application. The date path above follows that model and the cited report. Engineering must reproduce it in the product.

## Cause and proposed fix

booking-v3 prints MM/DD/YYYY for a tenant whose form reads day first. The misleading hint makes a person supply the opposite order. This is separate from the shared parser always reading month first.

Derive the form hint and interpretation from the same tenant locale. A shared-parser-only fix cannot correct the displayed hint.

## Acceptance checks

- [ ] Check the hint and entered date together for de-DE, es-ES, and pt-PT booking-v3 tenants.
- [ ] Verify that a person following the hint for 6 January gets 6 January, including an ambiguous date.
- [ ] Check booking-v2 and a month-first tenant as controls. Keep app and email parser reports in their separate issue.

## How this count was obtained

Deduplicate the export by report ID, filter mergedInto === 4471, and call causeOf with each report's channel and tenant record. This is the hint group.

Intake guesses inside this group: parser 15, hint 18. Tags do not determine the cause.

Run `npm run prepare-tickets` to regenerate this draft and `npm run verify` to check the grouping and the rendered page. See [the signed review](https://github.com/timkrase/mega-s01e03-what-it-shows/blob/main/src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx) and [its rendered HTML](https://github.com/timkrase/mega-s01e03-what-it-shows/blob/main/rendered/4471-review.html).

## Report IDs

<details>
<summary>33 distinct report IDs</summary>

R-41230, R-41241, R-41251, R-41259, R-41262, R-41275, R-41294, R-41305, R-41308, R-41366, R-41372, R-41384, R-41387, R-41396, R-41400, R-41406, R-41415, R-41416, R-41418, R-41428, R-41439, R-41441, R-41449, R-41453, R-41456, R-41460, R-41472, R-41485, R-41493, R-41539, R-41572, R-41582, R-41584

</details>
