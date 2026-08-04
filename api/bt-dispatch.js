// Vercel serverless function. The form calls this on a successful submission with the
// full lead; it fires a GitHub repository_dispatch carrying that lead, which starts the
// bt-sync Action. This is what makes the sync "on-demand" — the bot runs ~once per real
// lead instead of polling on a timer, and there's no separate lead store to maintain.
//
// The lead travels in the dispatch payload; the Action fills Buildertrend from it. The
// team's notification email (sent separately by the form) is the durable backup if the
// push fails.
//
// Security: this endpoint is public, which is the same threat surface as the form's other
// client-side calls (EmailJS) — a spammer could already forge submissions. Acceptable for
// launch; a honeypot field / rate-limit is a later hardening. Don't put a "secret" in the
// browser — it wouldn't be secret. We do cap the payload size and require an email so junk
// is cheap to reject.
//
// Env (Vercel project settings, server-side — never exposed to the browser):
//   GITHUB_TOKEN  — fine-grained PAT with "Contents: read" + "Actions: write" on the repo
//   GITHUB_REPO   — e.g. "michaelconnery/MGMLeads"

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const token = process.env.GITHUB_TOKEN
  const repo  = process.env.GITHUB_REPO
  if (!token || !repo) return res.status(500).json({ error: 'not configured' })

  const { lead, submissionId } = req.body || {}
  if (!lead || typeof lead !== 'object' || !lead.email) {
    return res.status(400).json({ error: 'lead with an email is required' })
  }
  // repository_dispatch client_payload is capped (~64KB). Our leads are tiny; guard anyway.
  if (JSON.stringify(lead).length > 60_000) {
    return res.status(413).json({ error: 'lead too large' })
  }

  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'new-lead',
        client_payload: { lead, submissionId: submissionId || null },
      }),
    })
    if (!r.ok) {
      const body = await r.text().catch(() => '')
      console.error('[bt-dispatch] GitHub dispatch failed', r.status, body)
      return res.status(502).json({ error: 'dispatch failed' })
    }
    return res.status(202).json({ ok: true })
  } catch (err) {
    console.error('[bt-dispatch]', err)
    return res.status(500).json({ error: 'dispatch error' })
  }
}
