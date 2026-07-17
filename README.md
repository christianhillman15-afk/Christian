# Christian Hillman — Personal Website

A professional multi-page website for Christian Hillman: digital marketing and web professional
working with [Oxsome](https://oxsome.com) (web design & AI marketing) and
[Launch Media](https://wearelaunchmedia.com) (programmatic advertising).

**Live:** https://www.christianrhillman.com

## Structure

```
index.html          Home — hero, services overview, stats, experience, process, quote, CTA
services.html       Services — detailed breakdown of each service + FAQ
about.html          About — bio, quick facts, values, philosophy
contact.html        Contact — contact details + enquiry form
404.html            Custom not-found page
assets/css/style.css   Design system + all component styles
assets/js/main.js      Header, mobile menu, scroll reveal, FAQ accordion, contact form
assets/js/analytics.js GA4 / Search Console scaffold (inert until IDs added)
assets/og-image.png    1200x630 social share image
api/telegram-notify.js Serverless function: Telegram alert for form submissions
favicon.svg            Monogram favicon
site.webmanifest       PWA/manifest metadata
robots.txt             Crawl rules
sitemap.xml            Sitemap for search engines
vercel.json            Clean config: security headers + long-term asset caching
```

No build step and no framework — plain HTML, CSS, and JavaScript. Fonts are loaded from
Google Fonts (Plus Jakarta Sans + Inter). Icons are inline SVG.

## Design

- Light, editorial layout with a warm orange accent (`--brand: #ff5b2e`) and ink-navy dark sections
- Fully responsive with a mobile menu, and respects `prefers-reduced-motion`
- SEO-ready: per-page titles/descriptions, canonical URLs, Open Graph/Twitter tags, and
  JSON-LD structured data on the home page
- All design tokens live as CSS variables at the top of `assets/css/style.css`

## Contact form, email & alerts

Contact address used across the site: **christian@christianrhillman.com** (Zoho).

The contact form on `contact.html` submits to **Web3Forms** (email to the inbox) and fires a
best-effort **Telegram** alert. Both are inert until configured — until then the form falls back
to opening the visitor's email app (`mailto:`), so it always works.

### 1. Web3Forms (email to your inbox) — free, no server

1. Go to https://web3forms.com, enter `christian@christianrhillman.com`, and copy the **Access Key**
   emailed to you (it's public-safe — an alias to your email, fine to keep in the page).
2. In `contact.html`, replace `YOUR_WEB3FORMS_ACCESS_KEY` in
   `<input type="hidden" name="access_key" value="…">` with your key.
3. Commit + push. Submissions now arrive at your Zoho inbox.

### 2. Telegram alerts — free (Vercel serverless function)

`api/telegram-notify.js` sends a Telegram message on each submission, keeping your bot token
server-side (never in the browser). To activate:

1. In Telegram, message **@BotFather** → `/newbot` → copy the **bot token**.
2. Message your new bot once (say "hi"), then open
   `https://api.telegram.org/bot<token>/getUpdates` and copy `result[0].message.chat.id`
   (or use **@userinfobot**). That's your **chat id**.
3. In Vercel → Project → **Settings → Environment Variables**, add:
   - `TELEGRAM_BOT_TOKEN` = your bot token
   - `TELEGRAM_CHAT_ID` = your chat id
4. Redeploy (any push, or Vercel → Deployments → Redeploy).

> Web3Forms also offers a no-code Telegram integration, but only on its **paid** plans. The
> serverless function above is the free equivalent.

### Analytics (optional)

`assets/js/analytics.js` is an inert GA4 scaffold. Add your `G-XXXXXXXXXX` id there, and add
Google's hosts to the CSP in `vercel.json` (documented at the top of `analytics.js`). Paste any
Google Search Console `<meta>` verification tag into the `<head>` placeholder in `index.html`.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Deploying

The site is deployed to Vercel. Any static host works — just upload the repository root.
To publish with GitHub Pages instead, enable Pages on the `main` branch (`/` root) in repo settings.
