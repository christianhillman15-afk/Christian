/* =============================================================
   Analytics scaffold — Google Analytics 4 (GA4)
   -------------------------------------------------------------
   This file is INERT until you add a real Measurement ID below.
   No tracking runs, no cookies are set, and no network requests
   are made while GA4_MEASUREMENT_ID is empty.

   TO ACTIVATE:
   1. Paste your GA4 Measurement ID (looks like "G-XXXXXXXXXX")
      into GA4_MEASUREMENT_ID below.
   2. IMPORTANT: the site's Content-Security-Policy (in vercel.json)
      currently only allows scripts from this site. Add Google's
      hosts so GA can load, changing the script-src / connect-src /
      img-src lines to include:
        script-src  ... https://www.googletagmanager.com
        connect-src ... https://www.google-analytics.com https://region1.google-analytics.com
        img-src     ... https://www.google-analytics.com
   3. (Google Search Console) paste your verification <meta> tag
      into the <head> of index.html where the placeholder comment is.

   Do NOT invent a Measurement ID — leave it blank until you have
   the real one from your own Google Analytics account.
   ============================================================= */
(function () {
  'use strict';

  // ---- CONFIG -------------------------------------------------
  var GA4_MEASUREMENT_ID = ''; // e.g. 'G-XXXXXXXXXX'  (blank = disabled)
  // -------------------------------------------------------------

  var enabled = /^G-[A-Z0-9]+$/.test(GA4_MEASUREMENT_ID);

  // track(): safe no-op until GA4 is enabled.
  function track(eventName, params) {
    if (!enabled || typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params || {});
  }
  // expose for manual use if ever needed
  window.siteTrack = track;

  if (enabled) {
    // Load gtag.js (requires the CSP change described above)
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_MEASUREMENT_ID);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID);
  }

  // ---- Event wiring (harmless while disabled) -----------------
  // Named actions on buttons/links via data-analytics="...".
  document.querySelectorAll('[data-analytics]').forEach(function (el) {
    el.addEventListener('click', function () {
      track(el.getAttribute('data-analytics'), { location: window.location.pathname });
    });
  });

  // Any mailto: link counts as an email click.
  document.querySelectorAll('a[href^="mailto:"]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('email_click', { location: window.location.pathname });
    });
  });

  // Contact form submission (the contact page form).
  var form = document.querySelector('form[data-contact]');
  if (form) {
    form.addEventListener('submit', function () {
      track('contact_form_submit', { location: window.location.pathname });
    });
  }
})();
