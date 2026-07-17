/* =============================================================
   Telegram alert for contact-form submissions (Vercel Serverless Function)
   -------------------------------------------------------------
   The contact form POSTs here after a successful Web3Forms submit.
   This runs on Vercel (server side) so your bot token is NEVER exposed
   in the browser.

   TO ACTIVATE — set two Environment Variables on the Vercel project
   (Project → Settings → Environment Variables), then redeploy:
     TELEGRAM_BOT_TOKEN   = the token from @BotFather (e.g. 123456:ABC-DEF...)
     TELEGRAM_CHAT_ID     = your numeric chat id (message your bot, then
                            open https://api.telegram.org/bot<token>/getUpdates
                            and copy chat.id — or use @userinfobot)

   Until both are set, this endpoint quietly does nothing (returns ok:false,
   reason:"not_configured"), so the contact form keeps working regardless.
   ============================================================= */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  // Light guard: block obvious cross-origin browser abuse. (Not bulletproof —
  // worst case is spam to your own chat; add a stricter check if needed.)
  var origin = req.headers.origin || '';
  if (origin && origin.indexOf('christianrhillman.com') === -1) {
    res.status(403).json({ ok: false, error: 'forbidden' });
    return;
  }

  var token = process.env.TELEGRAM_BOT_TOKEN;
  var chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    res.status(200).json({ ok: false, reason: 'not_configured' });
    return;
  }

  try {
    var body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};

    var clip = function (v, n) { return String(v == null ? '' : v).slice(0, n); };
    var name = clip(body.name, 200);
    var email = clip(body.email, 200);
    var company = clip(body.company, 200);
    var interest = clip(body.interest, 200);
    var message = clip(body.message, 3000);

    if (!name && !email && !message) {
      res.status(400).json({ ok: false, error: 'empty' });
      return;
    }

    var text = '🔔 New enquiry — christianrhillman.com\n\n'
      + '👤 ' + (name || '—') + '\n'
      + '✉️ ' + (email || '—') + '\n'
      + (company ? '🏢 ' + company + '\n' : '')
      + (interest ? '🎯 ' + interest + '\n' : '')
      + '\n' + (message || '—');

    var tg = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text, disable_web_page_preview: true })
    });
    var out = await tg.json().catch(function () { return {}; });
    res.status(200).json({ ok: !!out.ok });
  } catch (e) {
    res.status(200).json({ ok: false, error: 'send_failed' });
  }
};
