'use strict';

const MAX_ERROR_LENGTH = 500;

/**
 * Returns current time formatted as "DD.MM.YYYY HH:MM:SS MSK"
 */
function nowMsk() {
  return new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Escapes HTML special characters to prevent broken markup in Telegram messages.
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Formats a terminal error alert (all retries exhausted).
 *
 * @param {object} opts
 * @param {string} opts.appId   - Inngest app id (e.g. "catalog-sync")
 * @param {string} opts.fnId    - Inngest function id (e.g. "catalog-sync-daily")
 * @param {Error}  opts.error   - The error that caused the failure
 * @returns {string} HTML string for Telegram
 */
function formatError({ appId, fnId, error }) {
  const message = error?.message || String(error);
  const truncated = message.length > MAX_ERROR_LENGTH
    ? message.slice(0, MAX_ERROR_LENGTH) + '…'
    : message;

  return [
    `🔴 <b>ОШИБКА</b> — <code>${escapeHtml(fnId)}</code>`,
    '',
    `<b>Сервис:</b> ${escapeHtml(appId)}`,
    `<b>Функция:</b> ${escapeHtml(fnId)}`,
    `<b>Попытка:</b> финальная (ретраи исчерпаны)`,
    '',
    `<b>Ошибка:</b>`,
    `<pre>${escapeHtml(truncated)}</pre>`,
    '',
    `<b>Время:</b> ${nowMsk()} MSK`,
  ].join('\n');
}

module.exports = { formatError };
