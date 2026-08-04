// Central config, all from environment. Nothing secret is ever committed.
// In GitHub Actions these come from repo secrets / the dispatch payload; locally from a
// .env you export (see .env.example). Fail loud at startup if a required one is missing.

function required(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

export const config = {
  // Buildertrend
  BT_BASE_URL:  process.env.BT_BASE_URL || 'https://buildertrend.net',
  BT_USERNAME:  process.env.BT_USERNAME || '',   // only needed by login.js
  BT_PASSWORD:  process.env.BT_PASSWORD || '',   // only needed by login.js
  // Lead Opportunities list page; openLeadForm() then opens the "Add Lead Opportunity" modal.
  BT_NEW_LEAD_PATH: process.env.BT_NEW_LEAD_PATH || '/app/leads/opportunities',

  // The lead to push, as JSON. The workflow injects client_payload.lead here; locally you
  // set it by hand (see .env.example / the dry-run command in README).
  get BT_LEAD_JSON() { return required('BT_LEAD_JSON') },

  // Storage state produced by `npm run login`. In CI it's written from a secret.
  STORAGE_STATE_PATH: process.env.STORAGE_STATE_PATH || './storageState.json',

  // Alerts — set exactly one. Email uses the same EmailJS setup as the form, or a
  // Slack incoming webhook. notify.js picks whichever is configured.
  ALERT_SLACK_WEBHOOK: process.env.ALERT_SLACK_WEBHOOK || '',
  ALERT_EMAIL_TO:      process.env.ALERT_EMAIL_TO || '',
  EMAILJS_SERVICE_ID:  process.env.EMAILJS_SERVICE_ID || '',
  EMAILJS_TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID || '',
  EMAILJS_PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY || '',
  EMAILJS_PUBLIC_KEY:  process.env.EMAILJS_PUBLIC_KEY || '',

  // Default salesperson to assign new leads to (must match a name in BT), or '' for unassigned.
  DEFAULT_SALESPERSON: process.env.DEFAULT_SALESPERSON || '',

  // When set, fill the form but stop before Save and leave the browser open.
  DRY_RUN: process.env.DRY_RUN === '1',
}
