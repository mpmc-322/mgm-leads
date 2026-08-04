// ─── Buildertrend "Add Lead Opportunity" field map ──────────────────────────
//
// The lead here is the RAW MGM form state (the object the form sends to
// /api/bt-dispatch — see src/hooks/useFormState.js). Keys are `first_name`,
// `project_type`, `location_street`, etc.
//
// Form structure captured from the live BT app 2026-07-10 (see memory
// bt-lead-form-fields.md). Key facts baked in here:
//  - Fields are located by `id` (a few custom fields by `name`), NOT ASP.NET control names.
//  - Dropdowns are Kendo/React comboboxes: fillLead must click the widget and pick the
//    option by visible text — `selectOption` does NOT work. That's why combobox values
//    below are the option TEXT to match, not hidden codes.
//  - There are NO contact fields on this form. Name goes in Title; email/phone/vision go
//    in Notes (rich text). Contact-as-a-separate-entity is a later enhancement.
//  - Required: Title, Bedrooms, Full Baths, Half Baths, Budget Range. Beds/baths default
//    to 0 so renovation leads (which don't collect them) still save.
//
// Budget Range option text is now captured & mapped (see BUDGET_RANGE_OPTIONS). Remaining
// gaps: Sources (optional, a tree-select — left unmapped) and the reno budget bracket
// mismatch noted on BUDGET_RANGE_OPTIONS. Salespeople is left blank on purpose — BT already
// defaults new leads to "Michael Connery".

// how: 'text' | 'combobox' | 'checkbox' | 'richtext'
// by:  'id' (default) | 'name'
export const FIELDS = {
  title:        { id: 'name',                  how: 'text',     required: true },
  street:       { id: 'address.street',        how: 'text' },
  city:         { id: 'address.city',          how: 'text' },
  state:        { id: 'address.state',         how: 'text' },
  zip:          { id: 'address.zip',           how: 'text' },
  salespeople:  { id: 'salespeople',           how: 'combobox' },
  revenueStart: { id: 'estimatedStartPrice',   how: 'text' },
  revenueEnd:   { id: 'estimatedEndPrice',     how: 'text' },
  source:       { id: 'source',                how: 'combobox' },
  projectType:  { id: 'projectType',           how: 'combobox' },
  notes:        { id: null, richtextLabel: 'Notes', how: 'richtext' },

  // Custom fields
  cfTimeline:   { id: 'customFields.0.value',  how: 'text' },   // Timeline
  cfSqFt:       { id: 'customFields.5.value',  how: 'text' },   // Square Footage
  cfBedrooms:   { by: 'name', id: 'customFields.7.value', how: 'text', required: true },
  cfFullBaths:  { by: 'name', id: 'customFields.8.value', how: 'text', required: true },
  cfHalfBaths:  { by: 'name', id: 'customFields.9.value', how: 'text', required: true },
  cfLandOwns:   { id: 'customFields.10.value', how: 'checkbox' }, // Land - Already Owns
  cfDesignPlans:{ id: 'customFields.11.value', how: 'checkbox' }, // Design New House Plans
  cfBudgetRange:{ id: 'customFields.12.value', how: 'combobox', required: true }, // Budget Range
}

// ─── Combobox option text ────────────────────────────────────────────────────
// Left = MGM form value. Right = the EXACT visible option text in BT's dropdown.
// Unmapped values are left blank AND logged.

// CONFIRMED from the live form:
export const PROJECT_TYPE_OPTIONS = {
  new_build:  'New Home Construction',
  renovation: 'Addition/Remodel',
  not_sure:   '', // no matching BT option; goes to Notes
}

// Source is a MULTIPLE tree-select on BT (not captured yet) and is NOT required to save.
// Left unmapped for now: leadToForm sends '' → fillLead skips it → it's logged, not filed.
// Capture + map later; the referral source is also preserved in Notes.
export const SOURCE_OPTIONS = {
  google: '', instagram: '', facebook: '', houzz: '',
  friend_family: '', professional: '', drove_by: '', sign: '', other: '',
}

// REQUIRED field. Right side = the EXACT visible option text in BT's Budget Range dropdown
// (captured live 2026-07-18). BT has 6 "New Construction" + 3 "Remodel" tiers — see
// BT_BUDGET_LABELS below for the full authoritative list.
//
// ⚠️ BT's brackets DON'T line up with the MGM form's tiers, so this is a best-effort
// nearest-match. New-build maps cleanly at the top ($1M+); reno is lossy — BT only spans
// $200k–$600k, while the form's reno tiers run Under-$75k…$1M+. Entries with no honest fit
// are left '' (logged, and — since Budget Range is required — the save will fail loudly
// rather than file a wrong bracket). Resolve before a real reno lead goes live by either
// aligning the form's tiers to BT or adding matching options to BT's custom field.
export const BUDGET_RANGE_OPTIONS = {
  // new build → New Construction
  '600k-750k': '$600,000 - $800,000 New Construction',
  '750k-1m':   '$800,000 - $1,000,000 New Construction',
  '1m-1.5m':   '$1mil - $1.5mil New Construction',
  '1.5m-2m':   '$1.5mil - $2mil New Construction',
  '2m+':       '$2mil + New Construction',
  // renovation → Remodel (BT only covers $200k–$600k; below/above have no fit)
  'under-75k': '',
  '75k-150k':  '',
  '150k-300k': '$200,000 - $300,000 Remodel',
  '300k-500k': '$300,000 - $450,000 Remodel',
  '500k-1m':   '$450,000 - $600,000 Remodel',
  '1m+':       '',
  'not_sure':  '',
}

// The exact option strings BT accepts (source of truth for the mapping above).
export const BT_BUDGET_LABELS = [
  '$400,000 - $600,000 New Construction',
  '$600,000 - $800,000 New Construction',
  '$800,000 - $1,000,000 New Construction',
  '$1mil - $1.5mil New Construction',
  '$1.5mil - $2mil New Construction',
  '$2mil + New Construction',
  '$200,000 - $300,000 Remodel',
  '$300,000 - $450,000 Remodel',
  '$450,000 - $600,000 Remodel',
]

// ─── budget_range → numeric Estimated revenue [start, end] ────────────────────
export const BUDGET_TO_REVENUE = {
  'under-75k': [0, 75000],        '75k-150k':  [75000, 150000],
  '150k-300k': [150000, 300000],  '300k-500k': [300000, 500000],
  '500k-1m':   [500000, 1000000], '1m+':       [1000000, null],
  '600k-750k': [600000, 750000],  '750k-1m':   [750000, 1000000],
  '1m-1.5m':   [1000000, 1500000],'1.5m-2m':   [1500000, 2000000],
  '2m+':       [2000000, null],   'not_sure':  [null, null],
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function labelize(v) { return v ? String(v).replace(/_/g, ' ') : '' }

// Split a possibly-decimal bathrooms count (e.g. 2.5) into full + half.
function splitBaths(bathrooms) {
  const n = Number(bathrooms) || 0
  return { full: Math.floor(n), half: (n % 1) >= 0.5 ? 1 : 0 }
}

// Contact + everything without a native BT field goes here (rich text).
function buildNotes(lead) {
  const street = lead.location_street || lead.reno_street || ''
  const town   = lead.location_town   || lead.reno_town   || ''

  const lines = []
  const contact = [lead.email, lead.phone].filter(Boolean).join('  ·  ')
  if (contact) lines.push(`Contact: ${contact}`)
  if (lead.vision) lines.push('', `Vision: ${lead.vision}`)

  // Nuance the structured BT fields can't hold (checkboxes are boolean-only).
  const detail = [
    ['Land status',  labelize(lead.land_status)],
    ['Plans status', labelize(lead.plans_status)],
    ['Tax map',      lead.location_tax_map],
    ['Areas',        Array.isArray(lead.areas_of_interest) ? lead.areas_of_interest.join('; ') : ''],
    ['Reno scope',   Array.isArray(lead.reno_scope) ? lead.reno_scope.join('; ') : ''],
    ['Reno other',   lead.reno_scope_other],
    ['Year built',   lead.year_built],
    ['Current sqft', lead.current_sq_ft],
  ].filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== 0)
   .map(([k, v]) => `${k}: ${v}`)
  if (detail.length) lines.push('', ...detail)

  return lines.join('\n')
}

function mapOption(fieldName, table, formValue) {
  if (!formValue) return ''
  const code = table[formValue]
  if (code === '' || code === undefined) {
    console.warn(`[fieldMap] ${fieldName}: no BT option mapped for "${formValue}" — left blank`)
    return ''
  }
  return code
}

// ─── Raw MGM form lead → { fieldKey: value } for fillLead ──────────────────────
// text → string; combobox → option text to pick; checkbox → boolean; richtext → string.
export function leadToForm(lead) {
  const street = lead.location_street || lead.reno_street || ''
  const town   = lead.location_town   || lead.reno_town   || ''
  const zip    = lead.reno_zip || lead.location_zip || ''
  const name   = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.email

  const projType = mapOption('Project Type', PROJECT_TYPE_OPTIONS, lead.project_type)
  const [revStart, revEnd] = BUDGET_TO_REVENUE[lead.budget_range] || [null, null]
  const { full, half } = splitBaths(lead.bathrooms)

  // Title: "Jane Doe — New Home Construction, Brunswick"
  const titleBits = [name]
  const tail = [projType || labelize(lead.project_type), town].filter(Boolean).join(', ')
  const title = tail ? `${name} — ${tail}` : name

  return {
    title,
    street,
    city: town,
    state: 'ME',
    zip,
    salespeople: '', // filled from DEFAULT_SALESPERSON in fillLead
    revenueStart: revStart != null ? String(revStart) : '',
    revenueEnd:   revEnd   != null ? String(revEnd)   : '',
    source:       mapOption('Source', SOURCE_OPTIONS, lead.referral_source),
    projectType:  projType,
    notes:        buildNotes(lead),

    cfTimeline:   labelize(lead.timeline),
    cfSqFt:       lead.square_footage ? String(lead.square_footage) : '',
    cfBedrooms:   String(Number(lead.bedrooms) || 0),
    cfFullBaths:  String(full),
    cfHalfBaths:  String(half),
    cfLandOwns:   lead.land_status === 'owns',
    cfDesignPlans: lead.plans_status === 'no_plans',
    cfBudgetRange: mapOption('Budget Range', BUDGET_RANGE_OPTIONS, lead.budget_range),
  }
}
