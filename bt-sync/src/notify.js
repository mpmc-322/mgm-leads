// Failure alerting. The whole point of this integration is that a silent break can't
// lose leads — so anything that goes wrong must reach a human. Sends to a Slack webhook
// or via EmailJS, whichever is configured. Never throws; alerting must not itself fail
// the run in a way that hides the original problem.

import { config } from './config.js'

export async function alert(subject, detail) {
  const text = `🚨 BT lead sync: ${subject}\n\n${detail}`
  console.error('[notify]', subject, '—', detail)

  try {
    if (config.ALERT_SLACK_WEBHOOK) {
      await fetch(config.ALERT_SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      return
    }
    if (config.EMAILJS_SERVICE_ID && config.ALERT_EMAIL_TO) {
      // EmailJS server-side call uses the private key for auth (no browser origin check).
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id:   config.EMAILJS_SERVICE_ID,
          template_id:  config.EMAILJS_TEMPLATE_ID,
          user_id:      config.EMAILJS_PUBLIC_KEY,
          accessToken:  config.EMAILJS_PRIVATE_KEY,
          template_params: {
            to_email: config.ALERT_EMAIL_TO,
            subject:  `BT lead sync failed: ${subject}`,
            message_html: `<pre style="font:14px/1.5 monospace">${escapeHtml(text)}</pre>`,
          },
        }),
      })
      return
    }
    console.error('[notify] No alert channel configured — set ALERT_SLACK_WEBHOOK or EmailJS vars.')
  } catch (err) {
    console.error('[notify] Failed to send alert:', err)
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
}
