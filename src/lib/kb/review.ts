import { z } from 'zod';
import rawReports from '#lib/data/reports-4471.json';
import notes from '#lib/data/desk-notes.json';
import { groupByCause, readAs, ticketCause, uniqueById } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

const reportSchema = z.object({
  id: z.string(),
  receivedAt: z.iso.datetime({ offset: true }),
  tenant: z.string(),
  channel: z.enum(['app', 'email', 'form']),
  subject: z.string(),
  body: z.string(),
  meta: z.object({ browserLocale: z.string(), intakeTag: z.string() }),
  mergedInto: z.number().nullable(),
  mergedAt: z.iso.datetime({ offset: true }).nullable(),
});

export const exportedReports = z.array(reportSchema).parse(rawReports);
export const reports = uniqueById(exportedReports).filter((r) => r.mergedInto === 4471);
export const groups = groupByCause(reports, tenantOf);
export const owner = ticketCause(groups, 4471);
export const repeatedRows = exportedReports.length - uniqueById(exportedReports).length;
export const mismatchedTags = groups.reduce(
  (total, group) => total + group.reports.filter((r) => r.meta.intakeTag !== group.cause).length,
  0,
);
export const symptomNotes = groups.map((group) => ({ cause: group.cause, count: readAs(group, notes.oneDayMove) }));
export const notedReports = reports.filter((r) => notes.oneDayMove.includes(r.id));

export function receivedThrough(day: string): number {
  return reports.filter((r) => r.receivedAt.slice(0, 10) <= day).length;
}

export function mergedOn(day: string): number {
  return reports.filter((r) => r.mergedAt?.startsWith(day)).length;
}

export const lastReceived = reports.map((r) => r.receivedAt.slice(0, 10)).sort().at(-1);
