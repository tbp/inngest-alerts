'use strict';

const { Middleware } = require('inngest');
const { sendTelegram } = require('./lib/telegram');
const { formatError } = require('./lib/format');

/**
 * Inngest middleware that sends a Telegram alert when a function run fails
 * terminally (all retries exhausted).
 *
 * Usage:
 *   const { InngestTelegramAlerts } = require('inngest-alerts');
 *   const inngest = new Inngest({ id: 'my-app', middleware: [InngestTelegramAlerts] });
 */
class InngestTelegramAlerts extends Middleware.BaseMiddleware {
  id = 'telegram-alerts';

  async onRunError({ fn, error, isFinalAttempt }) {
    if (!isFinalAttempt) return;

    // Skip cancellation errors — they are handled by createCancelledAlertsFunction
    if (error?.message?.toLowerCase().includes('cancelled')) return;

    await sendTelegram(formatError({
      appId: this.client.id,
      fnId: fn.id,
      error,
    }));
  }
}

module.exports = { InngestTelegramAlerts };
