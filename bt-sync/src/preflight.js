// Preflight: before typing anything, prove the form is the shape we expect. This is the
// defense against silent drift — if Buildertrend (or a form edit) moved/renamed/removed a
// field we depend on, we abort the whole run and alert, having written nothing. Better a
// loud "field missing" email than a lead saved with blank fields nobody notices.

import { FIELDS } from './fieldMap.js'
import { locate } from './browser.js'

export async function preflight(page) {
  const problems = []

  for (const [key, field] of Object.entries(FIELDS)) {
    let count = 0
    try {
      count = await locate(page, field).count()
    } catch (err) {
      problems.push(`${key}: locator error (${err.message})`)
      continue
    }
    if (count === 0 && field.required) {
      problems.push(`${key}: required field not found (${field.by === 'name' ? 'name' : 'id'}="${field.id}")`)
    } else if (count === 0) {
      console.warn(`[preflight] optional field "${key}" not found — will skip it`)
    } else if (count > 1) {
      console.warn(`[preflight] "${key}" matched ${count} elements — will use the first`)
    }
  }

  if (problems.length) {
    throw new PreflightError(
      `Buildertrend New Lead form does not match the expected layout:\n - ${problems.join('\n - ')}`
    )
  }
}

export class PreflightError extends Error {}
