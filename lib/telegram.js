'use strict';

let _warnedMissing = false;

/**
 * Sends an HTML-formatted message to the configured Telegram chat.
 * Safe to call from Inngest middleware — never throws, logs errors instead.
 *
 * Requires env vars:
 *   TELEGRAM_BOT_TOKEN  — bot token from @BotFather
 *   TELEGRAM_CHAT_ID    — supergroup chat id (e.g. -1003697954818)
 *
 * @param {string} html - HTML-formatted message text
 * @returns {Promise<void>}
 */
async function sendTelegram(html) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    if (!_warnedMissing) {
      console.warn('[inngest-alerts] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set — alerts disabled');
      _warnedMissing = true;
    }
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[inngest-alerts] Telegram API error ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error('[inngest-alerts] Failed to send Telegram message:', err.message);
  }
}

module.exports = { sendTelegram };
