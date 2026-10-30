<script lang="ts">
  import { exportedReports, reports, groups, repeatedRows, mismatchedTags, notedReports, receivedThrough, mergedOn, lastReceived } from '#lib/kb/review';
</script>

<section aria-label="Export audit">
  <p><strong>{exportedReports.length}</strong> export rows contain <strong>{reports.length}</strong> distinct reports for #4471.
    The <strong>{repeatedRows}</strong> repeated rows have the same IDs and contents. Count each report ID once.</p>
  <p>Tenant locale, form version, and channel place every report in a cause group.
    Intake tags disagree with those groups for <strong>{mismatchedTags}</strong> reports.</p>
  <table>
    <caption>Classification from tenant data, compared with intake guesses</caption>
    <thead><tr><th>Actual cause</th><th>Tagged parser</th><th>Tagged hint</th><th>Channels</th></tr></thead>
    <tbody>
      {#each groups as group (group.cause)}
        <tr>
          <td>{group.cause}</td>
          <td>{group.taggedAs.parser ?? 0}</td>
          <td>{group.taggedAs.hint ?? 0}</td>
          <td>{['app', 'email', 'form'].map((channel) => `${channel}: ${group.reports.filter((r) => r.channel === channel).length}`).join(' · ')}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p><strong>{receivedThrough('2026-07-01')}</strong> reports arrived before 2 July.
    The desk merged <strong>{mergedOn('2026-07-02')}</strong> reports on 2 July, including the earlier backlog.
    The merge spike is not an arrival spike. Reports continue through <strong>{lastReceived}</strong>.</p>
</section>

<section aria-label="Reports needing symptom follow-up">
  <p><strong>{notedReports.length}</strong> reports are marked as one-day moves in the desk notes.
    The supplied classifier places them in the parser group. They are included in that count, not counted again as another cause.</p>
  <table>
    <caption>Preserved symptom notes</caption>
    <thead><tr><th>Report</th><th>Tenant and channel</th><th>What the reporter said</th></tr></thead>
    <tbody>
      {#each notedReports as report (report.id)}
        <tr><td>{report.id}</td><td>{report.tenant} · {report.channel}</td><td>{report.body}</td></tr>
      {/each}
    </tbody>
  </table>
  <p>These bodies do not establish a separate time-zone bug. Ask for the original date value, tenant locale,
    form version, and invite payload before changing their cause. Keep their symptoms visible until engineering checks them.</p>
</section>
