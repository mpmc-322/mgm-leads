// One-time interactive login. Run locally (NOT in CI): `npm run login`.
// Opens a real browser, lets you sign in by hand (solve any CAPTCHA / MFA yourself), then
// AUTO-SAVES the session to storageState.json the moment you actually reach the app. It will
// NOT save a half-finished session, and it polls in a way that survives the page navigations
// a login flow does, so slow CAPTCHA/MFA is fine.
// Upload the saved file's contents to the GitHub secret STORAGE_STATE so CI can reuse it.

import { chromium } from 'playwright'
import { config } from './config.js'

const LOGIN_URL = `${config.BT_BASE_URL}`
const WAIT_MS = 20 * 60 * 1000 // 20 min — plenty for CAPTCHA + MFA

async function main() {
  console.log('Opening Buildertrend. Log in in the browser window that appears.')
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(LOGIN_URL)

  console.log(`
────────────────────────────────────────────────────────────
Log in fully in the browser window — solve any CAPTCHA / MFA.
The moment you land on the Buildertrend app, this saves your
session automatically. Take as long as you need (up to 20 min).
Nothing is saved until you're actually signed in.
────────────────────────────────────────────────────────────`)

  // Poll for a completed login. We're in once we're on a buildertrend.net /app/* page (the
  // Auth0 handoff lives on login.buildertrend.com, so this only trips after a real sign-in).
  // Each check is wrapped so a mid-flight navigation can't crash the wait.
  let ok = false
  const deadline = Date.now() + WAIT_MS
  let i = 0
  while (Date.now() < deadline) {
    let where = '(navigating)'
    try {
      const st = await page.evaluate(() => ({
        host: location.hostname,
        path: location.pathname,
        inApp: location.hostname.endsWith('buildertrend.net') && location.pathname.startsWith('/app'),
      }))
      where = st.host + st.path
      if (st.inApp) { ok = true; break }
    } catch {
      // page is mid-navigation; try again next tick
    }
    if (i % 5 === 0) console.log(`[login] waiting… currently at: ${where}`)
    i++
    await page.waitForTimeout(2000).catch(() => {})
  }

  if (ok) {
    await page.waitForTimeout(2500) // let the final redirect set all cookies/tokens
    await context.storageState({ path: config.STORAGE_STATE_PATH })
    console.log(`\n✅ Logged in and saved session to ${config.STORAGE_STATE_PATH}`)
  } else {
    console.log('\n⚠️  Did not reach a Buildertrend /app page in time — NOT saving.')
    console.log('    If you did log in but landed elsewhere, tell Claude the URL you ended on.')
  }
  await browser.close().catch(() => {})
  process.exit(ok ? 0 : 1)
}

main().catch(err => { console.error(err); process.exit(1) })
