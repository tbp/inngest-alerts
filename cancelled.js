'use strict';

const { sendTelegram } = require('./lib/telegram');
const { formatCancelled } = require('./lib/format');

/**
 * Creates an Inngest function that listens for cancellation events and sends
 * a Telegram alert for the specified functions (or all functions if none specified).
 *
 * Usage:
 *   const { createCancelledAlertsFunction } = require('inngest-alerts');
 *
 *   serve({
 *     client: inngest,
 *     functions: [
 *       myFunction,
 *       createCancelledAlertsFunction(inngest),
 *       // or filter by specific functions:
 *       createCancelledAlertsFunction(inngest, { functionIds: ['catalog-sync-catalog-sync-daily'] }),
 *     ],
 *   });
 *
 * @param {import('inngest').Inngest} inngest - Inngest client instance
 * @param {object} [options]
 * @param {string[]} [options.functionIds] - Filter: only alert for these function ids.
 *   Format: "{appId}-{fnId}" (slugified, hyphen-separated).
 *   If omitted, alerts fire for ALL cancellations in this app.
 * @returns {import('inngest').InngestFunction}
 */
function createCancelledAlertsFunction(inngest, options = {}) {
  const { functionIds } = options;

  return inngest.createFunction(
    {
      id: 'alert-on-cancelled',
      triggers: [{ event: 'inngest/function.cancelled' }],
    },
    async ({ event }) => {
      const fnId = event.data?.function_id || 'unknown';
      const runId = event.data?.run_id || '';
      const reason = event.data?.error?.message || event.data?.error?.error || 'function cancelled';

      // Filter by specific function ids if provided
      if (functionIds && functionIds.length > 0 && !functionIds.includes(fnId)) {
        return { skipped: true, fnId };
      }

      await sendTelegram(formatCancelled({
        appId: inngest.id,
        fnId,
        runId,
        reason,
      }));

      return { alerted: true, fnId, runId };
    }
  );
}

module.exports = { createCancelledAlertsFunction };
