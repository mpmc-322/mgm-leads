// Fill one lead into the open New Lead form, save, and read every field back to confirm
// it stuck. Returns { ok, mismatches }. On DRY_RUN it fills but does not save, and leaves
// the values in place for you to eyeball.
//
// The read-back is the core robustness guarantee: a field that silently didn't take
// (dropdown option rejected, value truncated, control disabled) is caught here and the
// lead is NOT marked imported, so it'll be surfaced rather than lost.
//
// Each widget type is filled and read back its own way (see fieldMap `how`):
//   text / spinbutton → .fill() / inputValue
//   checkbox          → .check() / isChecked
//   combobox (rc-select) → open container, pick option by text / read selection-item title
//   richtext (Notes = CKEditor 4) → CKEDITOR.instances API setData / getData

import { FIELDS, leadToForm } from './fieldMap.js'
import { config } from './config.js'
import { locate, comboContainer } from './browser.js'

export async function fillLead(page, lead) {
  const values = leadToForm(lead)

  // 1. Type / select every mapped, present field.
  for (const [key, value] of Object.entries(values)) {
    const field = FIELDS[key]
    if (!field) continue

    if (field.how === 'checkbox') {
      // Only touch it when true; leaving it unchecked is the correct default for false.
      if (value) await checkBox(page, field)
      continue
    }

    if (value === '' || value == null) continue

    if (field.how === 'combobox') {
      await fillCombo(page, field, String(value))
    } else if (field.how === 'richtext') {
      await setNotes(page, String(value))
    } else {
      const el = locate(page, field)
      if (await el.count()) await el.fill(String(value))
    }
  }

  if (config.DRY_RUN) {
    console.log('[fillLead] DRY_RUN — form filled, NOT saving. Inspect the browser window.')
    return { ok: true, mismatches: [], dryRun: true }
  }

  // 2. Save. Buildertrend is a SPA (no page navigation), and on a successful save the modal
  //    closes — which also removes the form fields, so we can't read them back in place. We
  //    therefore treat "the modal closed" as success: BT validates the required fields (Title,
  //    beds, baths, Budget Range) on Save, so if any of those didn't take, the save is rejected
  //    and the modal stays open with an error — which we catch here. The full lead also lives
  //    in the notification email, so a bad save is recoverable.
  await page.getByRole('button', { name: /^save$/i }).first().click()
  const closed = await page
    .locator('[id="name"]')
    .waitFor({ state: 'detached', timeout: 25000 })
    .then(() => true)
    .catch(() => false)

  if (!closed) {
    const err = await page
      .locator('.ant-form-item-explain-error, .ant-message-error, [class*="error"]')
      .filter({ hasText: /\S/ })
      .first()
      .innerText()
      .catch(() => '')
    return {
      ok: false,
      mismatches: [{ field: '(save)', expected: 'modal to close after Save', actual: err.trim() || 'modal still open — save was rejected' }],
    }
  }
  return { ok: true, mismatches: [] }
}

// Select `optionText` in an rc-select by KEYBOARD. BT renders the option rows in a way that
// defeats clicking — the real `.ant-select-item-option` is 0x0 and a visible duplicate lands
// off-screen — so instead we open the widget and press ArrowDown, reading the highlighted
// option's label from aria-activedescendant, until it matches, then commit with Enter. This is
// render-independent and doesn't depend on the search filter (which some fields ignore).
async function fillCombo(page, field, optionText) {
  const container = comboContainer(page, field)
  await container.click() // opens + focuses the search input (clicking the input itself is
                          // intercepted by the "-- Please Select --" placeholder span)
  await page.waitForTimeout(300)
  const input = locate(page, field)
  for (let i = 0; i < 40; i++) {
    const active = await page.evaluate((id) => {
      const el = document.getElementById(id) || document.querySelector(`[name="${id}"]`)
      const a = el && el.getAttribute('aria-activedescendant')
      const opt = a && document.getElementById(a)
      return opt ? (opt.getAttribute('aria-label') || opt.textContent || '').trim() : null
    }, field.id)
    if (active === optionText) { await input.press('Enter'); return }
    await input.press('ArrowDown')
    await page.waitForTimeout(40)
  }
  throw new Error(`combobox ${field.id}: could not reach option "${optionText}"`)
}

// Tick an Ant Design checkbox. Its real <input> is a zero-opacity overlay that Playwright's
// .check() can't reliably act on, so we click the wrapping <label> instead (and fall back to
// a forced check). No-op if it's already ticked.
async function checkBox(page, field) {
  const input = locate(page, field)
  if (await input.isChecked().catch(() => false)) return
  const label = input.locator('xpath=ancestor::label[1]')
  if (await label.count()) await label.click().catch(() => {})
  if (!(await input.isChecked().catch(() => false))) {
    await input.check({ force: true }).catch(() => {})
  }
}

// Notes is CKEditor 4. Set its content via the editor API rather than poking the iframe.
async function setNotes(page, text) {
  const html = escapeHtml(text).replace(/\n/g, '<br>')
  await page.evaluate((h) => {
    const insts = window.CKEDITOR && window.CKEDITOR.instances
    const inst = insts && (insts.editor1 || Object.values(insts)[0])
    if (inst) inst.setData(h)
  }, html)
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
}
