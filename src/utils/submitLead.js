// Sends a completed inquiry to HubSpot via the Forms Submission API.
//
// Why the Forms API (and not the CRM API): this is a static client-side app
// with no backend, so we can't hold a private-app token securely. The Forms
// Submission endpoint needs no secret — just the portal ID + form GUID, which
// are safe to ship in the browser — and it creates/updates a HubSpot Contact.
// Buildertrend's native "new contact" sync then turns that contact into a Lead
// Opportunity. See HUBSPOT-SETUP.md.
//
// Submission is fire-and-forget: a HubSpot hiccup must never block the user's
// confirmation screen.

// ─── Config ──────────────────────────────────────────────────────────────────
// Fill these in after creating the form in the new MGM HubSpot account
// (HUBSPOT-SETUP.md, step 2). Until BOTH are set, submitLead() is a no-op that
// logs the mapped payload instead of POSTing, so local dev and previews don't error.
//
// New MGM HubSpot account (data region na2). The default api.hsforms.com submit
// host routes to na2 portals correctly (verified), so no regional host override
// is needed.
const HUBSPOT_PORTAL_ID = '246955946'
const HUBSPOT_FORM_GUID = '27e723ad-de00-4251-8f15-68e9b90a3572'

const SUBMIT_URL = (portalId, formGuid) =>
  `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`

// ─── project_details blob ──────────────────────────────────────────────────
// HubSpot's free tier caps custom properties at 10. Rather than spend a slot on
// each spec field the team only reads (never filters on), we fold them into one
// multi-line `project_details` text property. Only fields with a value appear.
function buildProjectDetails(lead) {
  const renoScope = Array.isArray(lead.reno_scope) ? lead.reno_scope.join('; ') : ''
  const areas     = Array.isArray(lead.areas_of_interest) ? lead.areas_of_interest.join('; ') : ''

  // Compact spec line — short labels joined with " · ".
  const specs = [
    ['Tax map',     lead.location_tax_map],
    ['Target sqft', lead.square_footage],
    ['Beds',        lead.bedrooms],
    ['Baths',       lead.bathrooms],
    ['Year built',  lead.year_built],
    ['Current sqft', lead.current_sq_ft],
  ]
    .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== 0)
    .map(([label, v]) => `${label}: ${v}`)
    .join(' · ')

  // Multi-value items get their own line so they stay readable.
  const lines = []
  if (specs)              lines.push(specs)
  if (areas)              lines.push(`Areas of interest: ${areas}`)
  if (renoScope)          lines.push(`Reno scope: ${renoScope}`)
  if (lead.reno_scope_other) lines.push(`— Other: ${lead.reno_scope_other}`)

  return lines.join('\n')
}

// ─── Field mapping ───────────────────────────────────────────────────────────
// Flattens the form's branch-specific fields (new-build vs. renovation) into a
// single set of HubSpot contact properties. The right-hand strings here MUST
// match the property internal names in HubSpot, and every field sent must exist
// on the HubSpot form or the Forms API rejects the whole submission.
//
// SEND_CUSTOM_PROPERTIES gates the qualification data (project type, budget,
// timeline, etc.). It's OFF: HubSpot is only a relay that creates the contact so
// Buildertrend's native sync makes a Lead Opportunity — and that sync carries only
// identity fields (it strips custom properties anyway). The full lead detail lives
// in the notification email, which is the durable record. Flip this to `true` (and
// create the 7 custom properties + add them to the form, per HUBSPOT-SETUP.md) if
// you later want the structured data in HubSpot for segmentation. No other change
// needed — the mapping below is ready.
const SEND_CUSTOM_PROPERTIES = false

function buildFields(lead) {
  // Address is collected under different keys per branch — normalize to one set
  // and map to HubSpot's default address properties (no custom slot needed).
  const street = lead.location_street || lead.reno_street || ''
  const town   = lead.location_town   || lead.reno_town   || ''
  const zip    = lead.reno_zip || lead.location_zip || ''

  // [internalName, value] pairs. Empty values are dropped before sending so we
  // don't overwrite existing contact data with blanks on a repeat submission.
  const pairs = [
    // Default HubSpot contact properties — always exist, no setup needed
    ['firstname',      lead.first_name],
    ['lastname',       lead.last_name],
    ['email',          lead.email],
    ['phone',          lead.phone],
    ['address',        street],
    ['city',           town],
    ['zip',            zip],
    ['state',          'ME'],            // MGM serves Maine
    ['message',        lead.vision],     // the customer's free-text vision
    ['hs_lead_status', 'NEW'],           // the field Buildertrend's sync triggers on

    // Custom properties — only sent when SEND_CUSTOM_PROPERTIES is on (see above)
    ...(SEND_CUSTOM_PROPERTIES ? [
      ['project_type',    lead.project_type],
      ['land_status',     lead.land_status],
      ['plans_status',    lead.plans_status],
      ['budget_range',    lead.budget_range],
      ['timeline',        lead.timeline],
      ['referral_source', lead.referral_source],
      ['project_details', buildProjectDetails(lead)],
    ] : []),
  ]

  return pairs
    .filter(([, value]) => value !== null && value !== undefined && value !== '' && value !== 0)
    .map(([name, value]) => ({ name, value: String(value) }))
}

// ─── Submit ──────────────────────────────────────────────────────────────────
export async function submitLead(lead) {
  if (!HUBSPOT_PORTAL_ID || !HUBSPOT_FORM_GUID) {
    // Not configured yet — log the payload so you can verify the mapping.
    console.info('[submitLead] HubSpot not configured; payload would be:', buildFields(lead))
    return { ok: false, reason: 'not_configured' }
  }

  const payload = {
    fields: buildFields(lead),
    context: {
      pageUri:  window.location.href,
      pageName: document.title,
    },
  }

  // Bound the wait: the notification email is sent after this resolves and reports
  // its status, so a hung request must not delay the email indefinitely.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(SUBMIT_URL(HUBSPOT_PORTAL_ID, HUBSPOT_FORM_GUID), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      signal:  controller.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[submitLead] HubSpot rejected submission', res.status, body)
      return { ok: false, reason: 'http_error', status: res.status }
    }
    return { ok: true }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[submitLead] submission timed out')
      return { ok: false, reason: 'timeout' }
    }
    // Network error, ad-blocker (ERR_BLOCKED_BY_CLIENT), offline, etc. — never
    // surface to the user, but the notification email will flag it.
    console.error('[submitLead] submission failed', err)
    return { ok: false, reason: 'network_error' }
  } finally {
    clearTimeout(timeout)
  }
}
