#!/usr/bin/env node
'use strict';

/**
 * Manual integration test — sends both a fake error alert and a cancellation alert
 * to Telegram to verify formatting and delivery.
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHAT_ID=yyy node test/send-test-alert.js
 *
 * Or with .env loaded (from catalog-sync dir):
 *   node -e "require('dotenv').config({ path: '../ovokacho-catalog-sync/.env' })" \
 *     -r dotenv/config test/send-test-alert.js
 */

// Allow running from the package root with env vars already set
require('../lib/telegram'); // warm up warning state

const { sendTelegram } = require('../lib/telegram');
const { formatError, formatCancelled } = require('../lib/format');

async function main() {
  console.log('Sending test error alert...');
  await sendTelegram(formatError({
    appId: 'catalog-sync',
    fnId: 'catalog-sync-catalog-sync-daily',
    error: new Error('TypeError: Cannot read properties of undefined (reading \'map\')\n    at syncRows (/app/lib/sync.js:42:18)\n    at step.run (/app/src/inngest/sync-function.js:12:5)'),
  }));
  console.log('✓ Error alert sent');

  await new Promise(r => setTimeout(r, 500));

  console.log('Sending test cancellation alert...');
  await sendTelegram(formatCancelled({
    appId: 'catalog-sync',
    fnId: 'catalog-sync-catalog-sync-daily',
    runId: '01JTEST000000000000000000',
    reason: 'function cancelled',
  }));
  console.log('✓ Cancellation alert sent');

  console.log('\nDone. Check the OVO - ALERTS Telegram group.');
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
