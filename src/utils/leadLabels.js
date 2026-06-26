// Human-readable labels for the form's machine values.
//
// The form stores compact values (e.g. budget_range: '600k-750k', timeline:
// 'within_3mo'). The notification email needs the friendly labels the customer
// actually saw (e.g. '$600k–$750k', 'Within 3 months'). Those labels live as
// local option arrays inside each step component; we mirror them here as plain
// value→label maps so the email-builder has one tidy place to read from. If the
// step labels ever change, update them here too.

export const PROJECT_TYPE = {
  new_build:  'New custom home',
  renovation: 'Renovation / addition',
  not_sure:   'Not sure yet — or both',
}

export const LAND_STATUS = {
  owns:           'Owns the land',
  under_contract: 'Land under contract or in mind',
  looking:        'Still looking for land',
  needs_help:     'Would like help finding land',
}

export const PLANS_STATUS = {
  has_full:  'Has full plans',
  has_rough: 'Has rough sketches or inspiration',
  no_plans:  'No plans — would like help designing',
}

export const TIMELINE = {
  within_3mo: 'Within 3 months',
  '3_6mo':    '3–6 months',
  '6_12mo':   '6–12 months',
  '12mo_plus': '12+ months',
  exploring:  'Just exploring',
}

export const REFERRAL_SOURCE = {
  google:        'Google or web search',
  instagram:     'Instagram',
  facebook:      'Facebook',
  houzz:         'Houzz',
  friend_family: 'Referral from a friend or family member',
  professional:  'Referral from a designer, architect, or realtor',
  drove_by:      'Drove by one of our projects',
  sign:          'Saw an MGM sign',
  other:         'Other',
}

// Both new-build and renovation budget tiers in one map — the form only ever
// shows the set matching the project type, so a given lead uses one or the other.
export const BUDGET = {
  // New build
  '600k-750k': '$600k–$750k',
  '750k-1m':   '$750k–$1M',
  '1m-1.5m':   '$1M–$1.5M',
  '1.5m-2m':   '$1.5M–$2M',
  '2m+':       '$2M+',
  // Renovation
  'under-75k': 'Under $75k',
  '75k-150k':  '$75k–$150k',
  '150k-300k': '$150k–$300k',
  '300k-500k': '$300k–$500k',
  '500k-1m':   '$500k–$1M',
  '1m+':       '$1M+',
  // Shared
  not_sure:    'Not sure yet',
}

export const RENO_SCOPE = {
  kitchen:    'Kitchen',
  bathroom:   'Bathroom(s)',
  addition:   'Addition / new room',
  whole_home: 'Whole-home renovation',
  exterior:   'Exterior (siding, roofing, windows)',
  outdoor:    'Outdoor space (deck, porch, etc.)',
  other:      'Other',
}

// Look up a value in a map, falling back to the raw value so unmapped data still
// shows up in the email rather than vanishing.
export function labelFor(map, value) {
  if (value === null || value === undefined || value === '') return ''
  return map[value] || String(value)
}
