// Orchestrator. Triggered on-demand: the form's Vercel function fires a GitHub
// repository_dispatch when a lead comes in, and the workflow passes that lead here as
// BT_LEAD_JSON. Flow:
//   parse the lead
//   → open saved BT session (alert if expired)
//   → preflight the form (alert + abort if drifted — nothing written)
//   → fill, save, read-back verify
//   → on any failure: alert. The lead is still in the team's notification email, so
//     nothing is lost; a human can re-file it.
//
// Exit non-zero if it failed, so the GitHub Action is marked red too.

import { config } from './config.js'
import { openSession, assertLoggedIn, openLeadForm, SessionError } from './browser.js'
import { preflight, PreflightError } from './preflight.js'
import { fillLead } from './fillLead.js'
import { alert } from './notify.js'

function parseLead() {
  try {
    const lead = JSON.parse(config.BT_LEAD_JSON)
    if (!lead || !lead.email) throw new Error('lead has no email')
    return lead
  } catch (err) {
    throw new Error(`Could not parse BT_LEAD_JSON: ${err.message}`)
  }
}

async function main() {
  const lead = parseLead()
  const who = `${lead.first_name || ''} ${lead.last_name || ''} <${lead.email}>`.trim()
  console.log(`[index] Pushing lead: ${who}`)

  const { browser, page } = await openSession()

  try {
    await page.goto(`${config.BT_BASE_URL}${config.BT_NEW_LEAD_PATH}`)
    await assertLoggedIn(page)
    await openLeadForm(page)
    await preflight(page)

    const { ok, mismatches, dryRun } = await fillLead(page, lead)

    if (dryRun) {
      console.log(`[index] DRY_RUN filled ${who} — inspect the browser, nothing was saved.`)
      console.log('[index] Leaving the browser open. Press Ctrl+C here when done.')
      await new Promise(() => {}) // hold the process (and the window) open until Ctrl+C
      return
    }
    if (!ok) {
      await alert(
        `verification mismatch for ${who}`,
        mismatches.map(m => `  ${m.field}: sent "${m.expected}", form shows "${m.actual}"`).join('\n')
          + `\n\nLead NOT confirmed in Buildertrend. It's in the team notification email — re-file manually.`
      )
      process.exit(1)
    }
    console.log(`[index] ✅ pushed & verified ${who}`)
  } catch (err) {
    const label = err instanceof SessionError ? 'session expired'
                : err instanceof PreflightError ? 'form layout drift'
                : `failed to push ${who}`
    await alert(label, err.message + `\n\nLead is in the team notification email — re-file manually.`)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

main().catch(async err => {
  await alert('unexpected crash', err.stack || err.message)
  process.exit(1)
})
