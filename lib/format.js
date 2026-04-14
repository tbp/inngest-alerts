'use strict';

const MAX_ERROR_LENGTH = 500;

/**
 * Returns current time formatted as "DD.MM.YYYY, HH:MM:SS"
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
 * @param {string} opts.appId   - Inngest app id (e.g. "release-calendar")
 * @param {string} opts.fnId    - Inngest function id (e.g. "release-calendar-daily")
 * @param {Error}  opts.error   - The error that caused the failure
 * @returns {string} HTML string for Telegram
 */
function formatError({ appId, fnId, error }) {
  const message = error?.message || String(error);
  const truncated = message.length > MAX_ERROR_LENGTH
    ? message.slice(0, MAX_ERROR_LENGTH) + '…'
    : message;

  const logFile = process.env.LOG_FILE;

  const lines = [
    `🔴 <b>${escapeHtml(appId)} / ${escapeHtml(fnId)}</b>`,
    `<i>${nowMsk()} MSK</i>`,
    '',
    `<pre>${escapeHtml(truncated)}</pre>`,
  ];

  if (logFile) {
    lines.push('');
    lines.push(`📋 <code>${escapeHtml(logFile)}</code>`);
  }

  return lines.join('\n');
}

/**
 * Formats a partial-failure warning alert (function completed successfully but had errors).
 *
 * @param {object} opts
 * @param {string} opts.appId    - Inngest app id (e.g. "zvuk-link-pipeline")
 * @param {string} opts.fnId     - Inngest function id (e.g. "zvuk-link-pipeline-daily")
 * @param {string} opts.title    - Short description of the warning
 * @param {string[]} [opts.details] - List of detail lines (e.g. per-step error counts)
 * @returns {string} HTML string for Telegram
 */
function formatWarning({ appId, fnId, title, details }) {
  const lines = [
    `⚠️ <b>${escapeHtml(appId)} / ${escapeHtml(fnId)}</b>`,
    `<i>${nowMsk()} MSK</i>`,
    '',
    `<b>${escapeHtml(title)}</b>`,
  ];

  if (details && details.length > 0) {
    lines.push('');
    for (const d of details) {
      lines.push(`• ${escapeHtml(d)}`);
    }
  }

  return lines.join('\n');
}

module.exports = { formatError, formatWarning };
