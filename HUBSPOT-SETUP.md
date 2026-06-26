# HubSpot + Buildertrend Setup

This is the one-time, click-through setup for the lead flow. The form code is done;
these are the parts that live in your HubSpot and Buildertrend accounts.

```
Form ──Forms API──▶ HubSpot Contact ──native "lead status" sync──▶ Buildertrend Lead Opportunity ──"Create a Job"──▶ Job
```

The form creates a **Contact** in HubSpot. Buildertrend's native integration watches for
contacts with a chosen Lead Status and creates a **Lead Opportunity** from each one. A person on
the team works the lead and, when it's worthwhile, manually converts it to a **Job** in Buildertrend.

> **Built for HubSpot's free tier.** It caps custom properties at 10, so this setup uses only
> **7 custom properties** — everything else maps to HubSpot's built-in default properties. See
> "Free-tier notes" at the bottom for what free doesn't include.

---

## Step 1 — Create the 7 custom contact properties

In HubSpot: **Settings → Properties → Contact properties → Create property.** The internal name
must match exactly (create with the exact label, then confirm/edit the internal name).

### Dropdown (single-select) properties — create each with these exact option **internal values**

| Internal name | Options (internal values) |
|---|---|
| `project_type` | `new_build`, `renovation`, `not_sure` |
| `land_status` | `owns`, `under_contract`, `looking`, `needs_help` |
| `plans_status` | `has_full`, `has_rough`, `no_plans` |
| `timeline` | `within_3mo`, `3_6mo`, `6_12mo`, `12mo_plus`, `exploring` |
| `referral_source` | `google`, `instagram`, `facebook`, `houzz`, `friend_family`, `professional`, `drove_by`, `sign`, `other` |
| `budget_range` | `600k-750k`, `750k-1m`, `1m-1.5m`, `1.5m-2m`, `2m+`, `under-75k`, `75k-150k`, `150k-300k`, `300k-500k`, `500k-1m`, `1m+`, `not_sure` |

> `budget_range` holds both new-build and renovation tiers in one property — the form only ever
> shows the set that matches the project type, so all values above are valid.

### Text property

| Internal name | Type |
|---|---|
| `project_details` | **Multi-line text** |

`project_details` is a consolidated read-only blob the form composes automatically — tax map,
target sqft, beds/baths, areas of interest, reno scope (+ other), year built, current sqft. It
exists so those 9 spec fields don't each burn a custom-property slot. Example value:

```
Tax map: R02-014 · Target sqft: 2600 · Beds: 4 · Baths: 2.5
Areas of interest: Brunswick; Topsham
```

### Default properties the form also fills — **do NOT create these, they already exist**

| Form data | HubSpot default property |
|---|---|
| First / last name, email, phone | `firstname` / `lastname` / `email` / `phone` |
| Street (new-build or reno) | `address` |
| Town | `city` |
| Zip | `zip` |
| *(always)* | `state` = `ME` |
| The customer's free-text "vision" | `message` |
| *(always)* | `hs_lead_status` = `NEW` ← Buildertrend's trigger field |

---

## Step 2 — Create the form and grab the IDs

1. **Marketing → Forms → Create form.** A regular HubSpot form is fine; we submit to it by GUID
   via the API, so it doesn't need to be embedded anywhere.
2. Add every property the form sends as a form field — the **7 custom** properties **and** the
   default ones it fills (`firstname`, `lastname`, `email`, `phone`, `address`, `city`, `zip`,
   `state`, `message`, `hs_lead_status`). They don't need to be visible/required — they just need
   to exist on the form so the API accepts their values.
3. Publish the form.
4. Get the two IDs:
   - **Portal ID (Hub ID):** top-right account menu, or Settings → Account Setup → Account
     Defaults. A number like `12345678`.
   - **Form GUID:** open the form → Share/Embed; the GUID is the long
     `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` string in the embed snippet (`formId`).
5. Paste both into **`src/utils/submitLead.js`**:
   ```js
   const HUBSPOT_PORTAL_ID = '12345678'
   const HUBSPOT_FORM_GUID = 'a1b2c3d4-...'
   ```
6. Rebuild/redeploy the form app (`npm run build`).

---

## Step 3 — Connect Buildertrend

In **Buildertrend → Company Settings → Marketplace → HubSpot → Connect** and authorize your
HubSpot account.

- Set the sync to trigger on **Lead Status = New** (the form stamps every submission with
  `hs_lead_status = NEW`, so every inquiry qualifies). Each new matching contact then becomes a
  Buildertrend Lead Opportunity.
- **⚠️ Confirm with Buildertrend support during setup** (this isn't fully documented publicly):
  *"On a free HubSpot account, does the sync trigger on contact Lead Status, and do I need to set
  that status myself?"* If they confirm lead-status-based, we're already set. If they say it needs
  a deal stage instead, tell me — free HubSpot can't auto-create deals, so we'd adjust the approach.
- **Future note:** if you later start importing contacts or capturing them from other forms/email,
  narrow the trigger (e.g. a dedicated lead status value) so only genuine inquiries sync.

---

## Step 4 — End-to-end test

1. Submit a real test lead through the live form (do one new-build and one renovation so the
   branch-specific fields are covered).
2. Confirm a **Contact** appears in HubSpot with the 7 custom properties + the defaults populated
   (check `address`/`city`/`zip`, `state` = ME, `message` = the vision text, `hs_lead_status` =
   New, and that `project_details` reads cleanly).
3. Wait for the sync interval, then confirm the contact shows up in Buildertrend as a
   **Lead Opportunity**.
4. From that lead, use **Create a Job** to confirm the manual lead → job conversion works.

---

## EmailJS notification email

Separate from HubSpot, every submission also sends a **polished internal "new inquiry" email**
to the MGM team with *every* field on its own row (no `project_details` blob — email has no
property cap). HubSpot free can't send internal alerts, so this is how the team gets a
nice-looking heads-up. It runs in addition to the HubSpot submission; HubSpot/Buildertrend stays
the system of record.

The whole email design lives in **`src/utils/buildNotificationEmail.js`** — EmailJS just delivers
the finished HTML.

### Ownership model

**You (the builder) own the EmailJS account; it sends *from* a client-domain mailbox.** Two things
are deliberately separate:

- **The EmailJS account** — the dashboard holding the keys + template. *You* own and operate this,
  so you can tweak the design without involving the client.
- **The sending mailbox** — the address mail goes *from*. We point this at a **client** Google
  address (e.g. `leads@mgmbuilders.com`) via **Custom SMTP + a Google app password**, so every
  alert reads *From `leads@mgmbuilders.com`* — never from you, and the client never has to log into
  EmailJS.

The client's only task is handing you **one Google app password** (see step 2 below). Both ends are
client addresses (`leads@mgmbuilders.com` → the team), which is just internal mail — deliverability
is a non-issue, so no Resend/transactional service or backend is needed.

> **Why a Google *app password* and not the normal password?** Google blocks plain
> password SMTP login. An app password is a 16-char token tied to one mailbox that lets EmailJS
> authenticate *as* that address. The From line is then clean — no OAuth screen, no "via emailjs"
> tag. Requires **2-Step Verification** on that Google account first.

### Setup

1. **Create the EmailJS account** at **emailjs.com** (use a project email you control, so it's
   transferable later).

2. **Get a Google app password for the sending mailbox.** On the Google account for
   `leads@mgmbuilders.com` (a dedicated `leads@`/`noreply@` account is cleanest — a Workspace admin
   can create one):
   - Turn on **2-Step Verification** (Google Account → Security).
   - Then **Security → App passwords → generate** (name it e.g. "EmailJS"). Copy the 16-character
     string — you won't see it again.

3. **EmailJS → Email Services → Add New Service → Other / Custom SMTP:**
   - **SMTP server:** `smtp.gmail.com`
   - **Port:** `465`, **Secure:** SSL/TLS  *(or port `587` with STARTTLS)*
   - **Username:** the full address, e.g. `leads@mgmbuilders.com`
   - **Password:** the **app password** from step 2 (not the account's login password)
   - **From name / From email:** `MGM Builders` / `leads@mgmbuilders.com`
   - Use EmailJS's **"Send test email"** to confirm the connection, then note the **Service ID**.

4. **EmailJS → Email Templates → Create New Template.** Make it a thin passthrough — our code
   supplies the whole body:
   - **To:** `{{to_email}}`
   - **Subject:** `{{subject}}`
   - **Content:** switch the editor to its code/HTML view and set the body to exactly
     `{{{message_html}}}` (triple braces = unescaped HTML; double braces would show raw tags).
   - **Reply-To:** leave blank — replies go back to the sending (MGM) address, per the chosen
     behavior. The customer's email is still a clickable `mailto:` inside the email body.
   - Save and note the **Template ID**.

5. **Account → General** — copy the **Public Key**. (Safe to ship in the browser; in
   **Account → Security** add your production domain to *Allowed Origins* so only your site can
   use it.)

6. Paste all three IDs + the recipient into **`src/utils/sendNotificationEmail.js`**:
   ```js
   const EMAILJS_SERVICE_ID  = 'service_xxx'
   const EMAILJS_TEMPLATE_ID = 'template_xxx'
   const EMAILJS_PUBLIC_KEY  = 'xxxxxxxxxxxx'
   const NOTIFY_TO = 'team@mgmbuilders.com'   // who should receive the alert
   ```
7. Rebuild/redeploy (`npm run build`).

> **Free tier:** ~200 emails/month. Plenty for inbound leads; upgrade if volume grows.
> Until the three IDs are set, `sendNotificationEmail()` is a no-op that logs the rendered email
> HTML to the console (`[sendNotificationEmail] ...`) so you can preview the design locally.

### Test it on your own domain first

Before involving the client, run the exact same setup against **your own** Google account so you've
seen it work end-to-end:

1. **Preview the design with zero setup.** `npm run dev`, complete a test submission (do one
   new-build and one renovation). With the IDs still blank, the console logs the full email HTML
   (`[sendNotificationEmail] ...`). Copy it into a `.html` file and open it in a browser to eyeball
   the layout before sending anything.
2. **Do steps 1–5 above using your own Google account** (app password on *your* mailbox, custom
   SMTP pointed at it). For step 6, set `NOTIFY_TO` to your own inbox so the test alert comes to
   you.
3. Run `npm run dev` again and submit a test lead. Confirm:
   - the email arrives in your inbox within a few seconds,
   - **From** shows your sending address (not "via emailjs"),
   - it renders correctly in Gmail **and** on your phone,
   - the `mailto:` and `tel:` links work,
   - clicking **Reply** goes to *your sending address*, not the fake lead's email.
4. When it all checks out, redo steps 2–6 with the **client's** account + app password, and set
   `NOTIFY_TO` to the real MGM recipient(s). The code doesn't change — you're only swapping which
   SMTP credentials and recipient live in the EmailJS service and `sendNotificationEmail.js`.

> Tip: you can keep **two EmailJS services** (yours + the client's) under one EmailJS account and
> just swap the `EMAILJS_SERVICE_ID` value when you go live — handy for re-testing later.

---

## Notes

- The form submits **fire-and-forget**: if HubSpot is unreachable, the visitor still sees the
  confirmation screen. Failures are logged to the browser console (`[submitLead] ...`), not shown
  to the user.
- Before the IDs are filled in, `submitLead()` logs the mapped payload to the console instead of
  sending — useful for verifying the field mapping locally.
- No HubSpot Deal or workflow is needed in this setup.

### Free-tier notes
- **No Workflows/Automation on free.** That means HubSpot won't auto-send follow-up emails or
  auto-assign leads to a rep. Internal "new lead!" alerts are covered two ways: the **EmailJS
  notification email** above (the polished, full-detail alert) and **Buildertrend's own new-lead
  notification** — so leads still get noticed. You'd only upgrade HubSpot later if you want
  HubSpot-driven nurture/automation (a phase-2 nice-to-have, not required here).
- Forms API, OAuth, and the Contacts API — everything this flow depends on — **are** included on free.
