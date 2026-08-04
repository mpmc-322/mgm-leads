// Sends a completed inquiry to the Buildertrend sync by POSTing it to our own
// serverless endpoint (/api/bt-dispatch), which fires a GitHub Action that fills the
// lead into Buildertrend's internal form via Playwright. See bt-sync/README.md.
//
// Why this instead of a direct integration: Buildertrend has no open API, and its native
// HubSpot sync drops our custom qualification fields. The only path that preserves the
// whole lead is filling the internal form as a logged-in user — which needs a backend to
// hold the automation trigger's token. That backend is /api/bt-dispatch.
//
// Submission is fire-and-forget: a hiccup here must never block the user's confirmation
// screen, and the team's notification email (sent alongside this) carries every field as
// the durable backup.

const DISPATCH_URL = '/api/bt-dispatch'

export async function dispatchLead(lead) {
  const submissionId =
    (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now())

  // Bound the wait: the notification email is sent after this resolves and reports its
  // status, so a hung request must not delay the email indefinitely.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(DISPATCH_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ lead, submissionId }),
      signal:  controller.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[dispatchLead] dispatch endpoint rejected submission', res.status, body)
      return { ok: false, reason: 'http_error', status: res.status }
    }
    return { ok: true }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[dispatchLead] submission timed out')
      return { ok: false, reason: 'timeout' }
    }
    // Network error, ad-blocker, offline, etc. — never surface to the user, but the
    // notification email will flag it.
    console.error('[dispatchLead] submission failed', err)
    return { ok: false, reason: 'network_error' }
  } finally {
    clearTimeout(timeout)
  }
}
