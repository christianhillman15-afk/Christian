# Christian Hillman — Personal Website

A professional multi-page website for Christian Hillman: digital marketing and web professional
working with [Oxsome](https://oxsome.com) (web design & AI marketing) and
[Launch Media](https://wearelaunchmedia.com) (programmatic advertising).

**Live:** https://christian-hillman.vercel.app

## Structure

```
index.html          Home — hero, services overview, stats, experience, process, quote, CTA
services.html       Services — detailed breakdown of each service + FAQ
about.html          About — bio, quick facts, values, philosophy
contact.html        Contact — contact details + enquiry form
404.html            Custom not-found page
assets/css/style.css   Design system + all component styles
assets/js/main.js      Header, mobile menu, scroll reveal, FAQ accordion, contact form
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

## The contact form

The form on `contact.html` uses progressive enhancement. With no backend configured it opens the
visitor's email app with the message pre-filled (`mailto:`), so it works immediately with no
secrets or server. To wire it to a real form backend (e.g. Formspree, Basin, Vercel serverless):

1. Add `data-endpoint="https://…"` and a matching `action`/`method` to the `<form data-contact>` tag.
2. When `data-endpoint` is present, `main.js` lets the browser POST normally instead of using `mailto:`.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Deploying

The site is deployed to Vercel. Any static host works — just upload the repository root.
To publish with GitHub Pages instead, enable Pages on the `main` branch (`/` root) in repo settings.
