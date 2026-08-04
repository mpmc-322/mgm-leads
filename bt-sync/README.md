# bt-sync — push web-form leads into Buildertrend

Buildertrend has no open API, and its HubSpot sync drops our custom qualification fields.
This service fills the **internal New Lead Opportunity form** (no captcha) as the dedicated
Buildertrend user, using a saved session. It runs **on-demand** — the form fires it when a
lead arrives — so it costs ~1 Action run per lead (free tier), no VPS, no polling.

```
Form submit ──┬─▶ sendNotificationEmail()      full-detail email to team = durable backup
              │
              └─▶ POST /api/bt-dispatch { lead, submissionId }
                        │  (Vercel fn holds the GitHub token; the browser can't)
                        ▼
                  GitHub repository_dispatch (type: new-lead, client_payload.lead = the lead)
                        ▼
                  this Action → open saved BT session → preflight form
                        → fill → Save → read-back verify → alert on any failure
```

No HubSpot, no lead store, no queue. The lead travels in the dispatch payload; the
notification email is the safety net if a push ever fails.

## Robustness (the whole point — it must not fail silently)

- **Read-back verification.** After Save, every field is re-read and compared to what was
  sent. Any mismatch → alert, and the lead is treated as NOT filed. A half-saved lead is
  never treated as done.
- **Preflight.** Before typing anything, the form is checked against the expected field set.
  If Buildertrend (or a form edit) moved/removed a field, the run aborts having written
  nothing, and alerts.
- **Session expiry** is detected (login page after navigation) and alerts you to re-run
  `npm run login` — it never logs in fresh on its own.
- **Durability.** Every failure alert points to the team notification email, which already
  holds the full lead. Nothing is lost even if a push fails.

## What you need to provide

1. **Field dump.** Open a New Lead Opportunity in Buildertrend, open DevTools console, run:
   ```js
   copy([...document.querySelectorAll('input,select,textarea')].map(el => ({
     name: el.name, id: el.id, type: el.type || el.tagName,
     label: el.labels?.[0]?.innerText?.trim() ?? el.getAttribute('aria-label') ?? '',
     options: el.tagName === 'SELECT' ? [...el.options].map(o => [o.value, o.text]) : undefined
   })))
   ```
   Paste the JSON. It fills `src/fieldMap.js` — the control names/IDs and the dropdown
   **option codes** (the `value`, not the visible text) for Source, Project Type, and any
   custom fields.
2. **`BT_NEW_LEAD_PATH`** — the URL path of the New Lead form.
3. **Alert channel** — a Slack webhook, or EmailJS creds + recipient.
4. **Default salesperson** (or leave unassigned).

## One-time setup

**Session:**
```
cd bt-sync && npm install && npx playwright install chromium
cp .env.example .env    # fill BT_BASE_URL, BT_NEW_LEAD_PATH, alert vars
npm run login           # log in by hand → writes storageState.json
```
Copy `storageState.json`'s contents into GitHub secret `STORAGE_STATE`.

**GitHub secrets:** `STORAGE_STATE`, `BT_BASE_URL`, `BT_NEW_LEAD_PATH`,
`DEFAULT_SALESPERSON`, and your alert vars. (No lead secret — the lead comes in the
dispatch payload.)

**Vercel:** set `GITHUB_TOKEN` (fine-grained PAT, Actions: write + Contents: read on this
repo) and `GITHUB_REPO`. The form's `dispatchLead()` already POSTs to `/api/bt-dispatch`.

## Test before going live (per project rule: never submit to production during dev)

```
# with a saved session + the field dump filled in:
DRY_RUN=1 BT_LEAD_JSON='{…sample lead…}' npm run run
```
Fills the real form, **stops before Save**, leaves the browser open so you can eyeball every
field. A ready-to-use sample lead is in `.env.example`.

Only after a dry run looks right do you run live against a **deletable** test lead:
```
BT_LEAD_JSON='{…}' npm run run    # fills, saves, verifies
```

Also: **confirm with your Buildertrend CSM that scripted access is acceptable under your
plan's terms**, and check whether your plan charges per user — a dedicated seat at $39/mo
would change the economics.
