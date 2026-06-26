// Renders the internal "new inquiry" notification email as a self-contained HTML
// string. Pure function: buildNotificationEmail(lead) → { subject, html }.
//
// Why the design lives here (not in EmailJS's template editor): keeping the whole
// email in code means it's versioned, reviewable, and easy to tweak. EmailJS just
// delivers the rendered HTML (see sendNotificationEmail.js).
//
// Email-client constraints drive the markup choices: table-based layout, every
// style inline, no flexbox/grid, no <style> block. Field rows only render when the
// field has a value, and whole sections are skipped when empty — so a renovation
// lead never shows blank new-build rows (and vice versa).

import {
  PROJECT_TYPE, LAND_STATUS, PLANS_STATUS, TIMELINE,
  REFERRAL_SOURCE, BUDGET, RENO_SCOPE, labelFor,
} from './leadLabels'

const LOGO_URL =
  'https://images.squarespace-cdn.com/content/v1/57cc6f8c414fb5cb6287a055/1515183506610-XQNB8DDP1ZLHF22XBBJ7/Website+Logo+2018.png?format=300w'

// Brand tokens (mirrors src/index.css)
const NAVY   = '#0E1B2C'
const SLATE  = '#4A7FA5'
const PANEL  = '#F7F6F3'
const BORDER = '#E0DDD7'
const MUTED  = '#6B7280'
const FONT   = "'Montserrat','Helvetica Neue',Arial,sans-serif"

// ─── helpers ─────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function hasValue(v) {
  return v !== null && v !== undefined && v !== '' && v !== 0
}

// One label/value row inside a section table.
function row(label, value) {
  if (!hasValue(value)) return ''
  return `
    <tr>
      <td style="padding:7px 0;vertical-align:top;width:42%;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:${MUTED};font-family:${FONT};">${esc(label)}</td>
      <td style="padding:7px 0;vertical-align:top;font-size:15px;color:${NAVY};font-family:${FONT};font-weight:500;">${value}</td>
    </tr>`
}

// A titled section block. Returns '' when none of its rows have values.
function section(title, rowsHtml) {
  const body = rowsHtml.filter(Boolean).join('')
  if (!body) return ''
  return `
    <tr><td style="padding:22px 28px 0 28px;">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${SLATE};font-weight:700;font-family:${FONT};border-bottom:1px solid ${BORDER};padding-bottom:8px;">${esc(title)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${body}</table>
    </td></tr>`
}

// ─── main ────────────────────────────────────────────────────────────────────
export function buildNotificationEmail(lead) {
  const isReno = lead.project_type === 'renovation'

  // Address is collected under per-branch keys — normalize like submitLead.js.
  const street = lead.location_street || lead.reno_street || ''
  const town   = lead.location_town   || lead.reno_town   || ''
  const zip    = lead.reno_zip || ''

  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(' ').trim()
  const projectLabel = labelFor(PROJECT_TYPE, lead.project_type)

  const areas = Array.isArray(lead.areas_of_interest) ? lead.areas_of_interest : []
  const renoScope = Array.isArray(lead.reno_scope)
    ? lead.reno_scope.map(v => labelFor(RENO_SCOPE, v)).filter(Boolean)
    : []

  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }) + ' ET'

  // ── subject ──
  const subjectParts = ['New inquiry']
  if (fullName)      subjectParts.push(fullName)
  if (projectLabel)  subjectParts.push(projectLabel)
  if (town)          subjectParts.push(town)
  const subject = subjectParts.join(' · ')

  // ── contact card ──
  const contactCard = `
    <tr><td style="padding:24px 28px 4px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${PANEL};border:1px solid ${BORDER};border-radius:6px;">
        <tr><td style="padding:20px 22px;">
          ${fullName ? `<div style="font-size:20px;font-weight:700;color:${NAVY};font-family:${FONT};">${esc(fullName)}</div>` : ''}
          <div style="margin-top:10px;font-family:${FONT};font-size:15px;line-height:1.7;">
            ${hasValue(lead.email) ? `<div>✉&nbsp; <a href="mailto:${esc(lead.email)}" style="color:${SLATE};text-decoration:none;font-weight:600;">${esc(lead.email)}</a></div>` : ''}
            ${hasValue(lead.phone) ? `<div>☎&nbsp; <a href="tel:${esc(String(lead.phone).replace(/[^\d+]/g, ''))}" style="color:${SLATE};text-decoration:none;font-weight:600;">${esc(lead.phone)}</a></div>` : ''}
          </div>
        </td></tr>
      </table>
    </td></tr>`

  // ── sections ──
  const projectSection = section('Project', [
    row('Project type', esc(projectLabel)),
    !isReno ? row('Land', esc(labelFor(LAND_STATUS, lead.land_status))) : '',
    !isReno ? row('Plans', esc(labelFor(PLANS_STATUS, lead.plans_status))) : '',
    isReno  ? row('Scope', renoScope.length ? esc(renoScope.join(', ')) : '') : '',
    isReno  ? row('Scope — other', esc(lead.reno_scope_other)) : '',
  ])

  const locationSection = section('Location', [
    row('Street', esc(street)),
    row('Town', esc(town)),
    row('Zip', esc(zip)),
    row('Tax map', esc(lead.location_tax_map)),
    areas.length ? row('Areas of interest', esc(areas.join(', '))) : '',
  ])

  const sizeSection = isReno
    ? section('Home details', [
        row('Year built', lead.year_built),
        row('Current sq ft', hasValue(lead.current_sq_ft) ? Number(lead.current_sq_ft).toLocaleString() : ''),
      ])
    : section('Size & layout', [
        row('Target sq ft', hasValue(lead.square_footage) ? Number(lead.square_footage).toLocaleString() : ''),
        row('Bedrooms', lead.bedrooms),
        row('Bathrooms', lead.bathrooms),
      ])

  const budgetSection = section('Budget & timeline', [
    row('Budget range', esc(labelFor(BUDGET, lead.budget_range))),
    row('Timeline', esc(labelFor(TIMELINE, lead.timeline))),
  ])

  const referralSection = section('How they heard about us', [
    row('Source', esc(labelFor(REFERRAL_SOURCE, lead.referral_source))),
  ])

  const visionSection = hasValue(lead.vision) ? `
    <tr><td style="padding:22px 28px 0 28px;">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${SLATE};font-weight:700;font-family:${FONT};border-bottom:1px solid ${BORDER};padding-bottom:8px;">Their vision</div>
      <div style="margin-top:12px;padding:16px 18px;background:${PANEL};border-left:3px solid ${SLATE};border-radius:0 4px 4px 0;font-family:${FONT};font-size:15px;line-height:1.6;color:${NAVY};font-style:italic;">${esc(lead.vision).replace(/\n/g, '<br>')}</div>
    </td></tr>` : ''

  // ── assemble ──
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#EEECE8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEECE8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">

        <!-- logo -->
        <tr><td align="center" style="padding:28px 28px 8px 28px;background:#ffffff;">
          <img src="${LOGO_URL}" alt="MGM Builders" width="180" style="display:block;border:0;width:180px;max-width:60%;height:auto;">
        </td></tr>

        <!-- title bar -->
        <tr><td style="padding:8px 28px 4px 28px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:${NAVY};font-family:${FONT};letter-spacing:.01em;">New project inquiry</div>
          ${projectLabel ? `<div style="display:inline-block;margin-top:10px;padding:5px 14px;background:${SLATE};color:#ffffff;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-radius:99px;">${esc(projectLabel)}</div>` : ''}
          <div style="margin-top:10px;font-family:${FONT};font-size:12px;color:${MUTED};">${esc(submittedAt)}</div>
        </td></tr>

        ${contactCard}
        ${projectSection}
        ${locationSection}
        ${sizeSection}
        ${budgetSection}
        ${referralSection}
        ${visionSection}

        <!-- footer -->
        <tr><td style="padding:26px 28px 28px 28px;">
          <div style="border-top:1px solid ${BORDER};padding-top:16px;font-family:${FONT};font-size:11px;line-height:1.5;color:${MUTED};text-align:center;">
            Sent automatically by the MGM Builders inquiry form.
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`

  return { subject, html }
}
