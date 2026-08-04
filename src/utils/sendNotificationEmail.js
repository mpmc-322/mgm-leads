// Sends the internal "new inquiry" notification email to the MGM team via EmailJS.
//
// Why EmailJS: this is a static client-side app with no backend, so we can't run
// an SMTP server or hold a private mail-API secret. EmailJS sends mail from the
// browser using a *public* key (safe to ship — lock it to the production domain in
// the EmailJS dashboard). We render the entire email body ourselves
// (buildNotificationEmail.js) and hand EmailJS the finished HTML, so the design
// lives in this repo, not in EmailJS's template editor.
//
// This runs in addition to submitLead() (HubSpot is the system of record; its
// native Buildertrend sync turns the contact into a Lead Opportunity).
// Fire-and-forget: a mail hiccup must never block the user's confirmation screen.

import emailjs from '@emailjs/browser'
import { buildNotificationEmail } from './buildNotificationEmail'

// ─── Config ──────────────────────────────────────────────────────────────────
// Fill these in after creating the EmailJS account/template (see HUBSPOT-SETUP.md,
// "EmailJS notification email"). Until SERVICE/TEMPLATE/PUBLIC_KEY are all set,
// sendNotificationEmail() is a no-op that logs the rendered HTML instead of sending,
// so local dev and previews don't error.
const EMAILJS_SERVICE_ID  = 'service_yxzd7ov'
const EMAILJS_TEMPLATE_ID = 'template_ukg9gym'
const EMAILJS_PUBLIC_KEY  = 'Ilofl3yG697Z9E1I3' // safe to ship; restrict to your domain in EmailJS
const NOTIFY_TO = 'mike@midcoastoperations.com' // TEST recipient (Mike) — swap to the real MGM team inbox before client go-live

// ─── Send ──────────────────────────────────────────────────────────────────
// `hubspot` is the result object from submitLead() ({ ok, reason, status? }), used
// to stamp the email with whether the lead reached HubSpot. May be undefined.
export async function sendNotificationEmail(lead, hubspot) {
  const { subject, html } = buildNotificationEmail(lead, hubspot)

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    // Not configured yet — log the rendered email so you can verify the design.
    console.info('[sendNotificationEmail] EmailJS not configured; email HTML would be:\n', html)
    return { ok: false, reason: 'not_configured' }
  }

  // These keys must match the {{variables}} used in the EmailJS template:
  //   To: {{to_email}}   Subject: {{subject}}   Body: {{{message_html}}}
  const params = {
    to_email:     NOTIFY_TO,
    subject,
    message_html: html,
  }

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, {
      publicKey: EMAILJS_PUBLIC_KEY,
    })
    return { ok: true }
  } catch (err) {
    // Network error, quota, ad-blocker, etc. — never surface to the user.
    console.error('[sendNotificationEmail] send failed', err)
    return { ok: false, reason: 'send_error' }
  }
}
