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

/**
 * Formats a cancellation alert (inngest/function.cancelled event).
 *
 * @param {object} opts
 * @param {string} opts.appId      - Inngest app id
 * @param {string} opts.fnId       - Cancelled function id (from event.data.function_id)
 * @param {string} opts.runId      - Run id (from event.data.run_id)
 * @param {string} [opts.reason]   - Cancellation reason/message
 * @returns {string} HTML string for Telegram
 */
function formatCancelled({ appId, fnId, runId, reason }) {
  const reasonText = reason || 'function cancelled';
  const truncated = reasonText.length > MAX_ERROR_LENGTH
    ? reasonText.slice(0, MAX_ERROR_LENGTH) + '…'
    : reasonText;

  return [
    `🟡 <b>ОТМЕНА</b> — <code>${escapeHtml(fnId)}</code>`,
    '',
    `<b>Сервис:</b> ${escapeHtml(appId)}`,
    `<b>Функция:</b> ${escapeHtml(fnId)}`,
    `<b>Run ID:</b> <code>${escapeHtml(runId || '—')}</code>`,
    '',
    `<b>Причина:</b>`,
    `<pre>${escapeHtml(truncated)}</pre>`,
    '',
    `<b>Время:</b> ${nowMsk()} MSK`,
  ].join('\n');
}

module.exports = { formatError, formatCancelled };
