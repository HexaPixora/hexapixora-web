# Google Search Console setup (≈ 20 minutes)

Gives the weekly routine real data: which searches show hexapixora.com, and where
we rank. Parts A–B are useful on their own even before automation.

## A. Verify the domain

1. Open https://search.google.com/search-console and sign in with the Google
   account that should own the data.
2. **Add property → Domain** (left box) → enter `hexapixora.com` → Continue.
3. Copy the TXT value it shows (`google-site-verification=…`).
4. In **Cloudflare → hexapixora.com → DNS → Records → Add record**:
   Type `TXT`, Name `@`, Content = the value you copied, TTL Auto → Save.
5. Back in Search Console click **Verify**. If it fails, wait 5–10 minutes and retry.

## B. Submit the sitemap

**Sitemaps** (left menu) → enter `sitemap.xml` → Submit. Status should become
"Success". Data starts appearing in **Performance** after 2–3 days.

Optional bonus: https://www.bing.com/webmasters → **Import from Google Search
Console**. Takes a minute and adds Bing/DuckDuckGo/ChatGPT search coverage.

## C. Create a read-only key for the routine

1. https://console.cloud.google.com → project picker → **New project**, name it
   `hexapixora-automation` → Create, then select it.
2. **APIs & Services → Library** → search **Google Search Console API** → Enable.
3. **IAM & Admin → Service Accounts → Create service account**. Name
   `gsc-reader` → Create and continue → skip the roles step → Done.
4. Copy its email (looks like `gsc-reader@hexapixora-automation.iam.gserviceaccount.com`).
5. Open it → **Keys → Add key → Create new key → JSON** → a `.json` file downloads.
   Keep it private: don't paste it into chat, email, or commit it to git.

## D. Give the key access to Search Console

Search Console → **Settings → Users and permissions → Add user** → paste the
service-account email → Permission **Restricted** (read-only) → Add.

## E. Hand it to the automation

Add these two lines to `D:\Workflow\Deployed\HexaPixora\secrets\hexapixora-automation.env` (or, for cloud
routines, to the cloud environment's variables):

```
GSC_SITE_URL=sc-domain:hexapixora.com
GSC_SERVICE_ACCOUNT_JSON=<the whole .json file contents on one line>
```

To get the file as one line in PowerShell:

```powershell
(Get-Content "$HOME\Downloads\hexapixora-automation-*.json" -Raw | ConvertFrom-Json | ConvertTo-Json -Compress -Depth 5) | Set-Clipboard
```

Then paste. The weekly playbook skips Search Console automatically while these are unset.
