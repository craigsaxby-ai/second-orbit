# Make.com → LinkedIn Auto-Publish Setup Guide

When a post is approved in Radar Mission Control, Second Orbit fires a webhook to Make.com. Make.com then publishes the post to LinkedIn automatically.

---

## Step 1 — Create a new scenario in Make.com

1. Log in to [make.com](https://www.make.com)
2. Click **Create a new scenario**
3. Give it a name like `Second Orbit – Radar LinkedIn Publisher`

---

## Step 2 — Add a Webhooks trigger

1. Click the **+** to add a module and search for **Webhooks**
2. Choose **Webhooks > Custom Webhook**
3. Click **Add** to create a new webhook — give it a name (e.g. `radar-approve`)
4. Copy the generated webhook URL (looks like `https://hook.eu1.make.com/xxxxxxxx`)

> **Save this URL** — you'll add it to your environment variables in Step 6.

When Make.com receives the webhook, the payload will include:

| Field | Description |
|---|---|
| `post_id` | Supabase row ID |
| `channel` | `CL` (Craig LinkedIn) or `SL` (Searchline) or `CP` (Content Pilot) |
| `topic` | Post topic |
| `hook` | Opening hook line |
| `draft_text` | Full post content |
| `scheduled_date` | Target publish date (YYYY-MM-DD) |
| `risk_status` | `green`, `yellow`, or `red` |

---

## Step 3 — Add a Router to branch by channel

1. After the webhook trigger, add a **Router** module
2. Create two routes: one for `CL` (personal profile) and one for `SL` (company page)
3. Set each route filter: **channel** → **Equal to** → `CL` / `SL`

---

## Step 4 — Add LinkedIn > Create a Post (personal profile) for CL

1. On the `CL` route, add a **LinkedIn > Create a Post** module
2. Set **Post As** to your personal profile
3. Map **Content / Text** → `{{1.draft_text}}` (the `draft_text` field from the webhook)
4. Optionally map visibility to "Public"

---

## Step 5 — Add LinkedIn > Create a Post (company page) for SL

1. On the `SL` route, add a **LinkedIn > Create a Post** module
2. Set **Post As** to the Searchline company page
3. Map **Content / Text** → `{{1.draft_text}}`
4. Optionally map visibility to "Public"

---

## Step 6 — Add the webhook URL to Vercel environment variables

1. Open your project in the [Vercel dashboard](https://vercel.com)
2. Go to **Settings → Environment Variables**
3. Add a new variable:
   - **Name:** `VITE_MAKE_RADAR_WEBHOOK_URL`
   - **Value:** the Make.com webhook URL from Step 2
   - **Environments:** Production (and Preview if desired)
4. Redeploy your app so the variable takes effect

For local development, add to your `.env.local`:
```
VITE_MAKE_RADAR_WEBHOOK_URL=https://hook.eu1.make.com/YOUR_HOOK_ID
```

---

## Step 7 — Test end-to-end

1. Open Radar Mission Control in Second Orbit
2. Find a drafted post with `risk_status` not set to `red`
3. Click **✓ Approve**
4. In Make.com, check the scenario's **History** tab — you should see a successful run
5. Verify the LinkedIn post was created on the correct profile/page

---

## Notes

- If `VITE_MAKE_RADAR_WEBHOOK_URL` is not set, the webhook is silently skipped — the UI will never break due to a missing or misconfigured webhook URL.
- Webhook errors (network timeouts, Make.com downtime) are also silently swallowed so the approval flow in Radar is never blocked.
- Bulk approve fires one webhook per post concurrently.
