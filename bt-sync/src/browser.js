// Shared Playwright helpers: open a browser with the saved session, open the New Lead
// modal, resolve a field locator from a fieldMap entry, and detect an expired session.
//
// Form facts (captured live 2026-07-18, see memory bt-lead-form-fields.md):
//  - Fields are located by `id`, except beds/full/half baths which use `name`.
//  - Field ids contain dots (`address.street`, `customFields.0.value`) so we always use
//    attribute selectors (`[id="…"]`) — a `#…` CSS selector would read the dots as class
//    separators.
//  - Dropdowns are Ant Design rc-select widgets (NOT native <select>): open by clicking the
//    `.ant-select` container, then pick the option by its visible text.
//  - Notes is a CKEditor 4 instance (`CKEDITOR.instances.editor1`), edited via its API.

import { chromium } from 'playwright'
import fs from 'node:fs'
import { config } from './config.js'

export async function openSession() {
  if (!fs.existsSync(config.STORAGE_STATE_PATH)) {
    throw new SessionError(`No saved session at ${config.STORAGE_STATE_PATH} — run \`npm run login\`.`)
  }
  const browser = await chromium.launch({ headless: !config.DRY_RUN })
  const context = await browser.newContext({ storageState: config.STORAGE_STATE_PATH })
  const page = await context.newPage()
  return { browser, context, page }
}

// The input/control for a field. Text, spinbutton, checkbox and the rc-select search input
// are all reachable this way; richtext (Notes) has no plain input, so it's handled via the
// CKEditor API in fillLead and located here only for a presence check.
export function locate(page, field) {
  if (field.how === 'richtext') return page.locator('[data-testid="notes"]')
  const attr = field.by === 'name' ? 'name' : 'id'
  return page.locator(`[${attr}="${field.id}"]`)
}

// The whole rc-select widget wrapping a combobox's search input — click this to open it,
// and read the chosen `.ant-select-selection-item` from it on read-back.
export function comboContainer(page, field) {
  return page.locator('.ant-select').filter({ has: locate(page, field) })
}

// Open the "Add Lead Opportunity" modal and wait for it to be interactive. The modal may
// already be routed in; otherwise we click the New Lead button, the same way a human does.
export async function openLeadForm(page) {
  const title = page.locator('[id="name"]')
  if (await title.isVisible().catch(() => false)) return
  await page.getByRole('button', { name: /Lead Opportunity/i }).first().click()
  await title.waitFor({ state: 'visible', timeout: 15000 })
}

// Heuristic: if after navigation we've landed on a login page, the session died.
export async function assertLoggedIn(page) {
  const url = page.url()
  const looksLikeLogin =
    /login|signin|auth/i.test(url) ||
    (await page.locator('input[type="password"]').count()) > 0
  if (looksLikeLogin) {
    throw new SessionError('Buildertrend session expired — re-run `npm run login` and update the STORAGE_STATE secret.')
  }
}

export class SessionError extends Error {}
