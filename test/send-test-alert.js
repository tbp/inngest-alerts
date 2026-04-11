#!/usr/bin/env node
'use strict';

/**
 * Manual integration test — sends a fake error alert to Telegram to verify
 * formatting and delivery.
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHAT_ID=yyy node test/send-test-alert.js
 */

require('../lib/telegram'); // warm up warning state

const { sendTelegram } = require('../lib/telegram');
const { formatError } = require('../lib/format');

async function main() {
  console.log('Sending test error alert...');
  await sendTelegram(formatError({
    appId: 'catalog-sync',
    fnId: 'catalog-sync-catalog-sync-daily',
    error: new Error('TypeError: Cannot read properties of undefined (reading \'map\')\n    at syncRows (/app/lib/sync.js:42:18)\n    at step.run (/app/src/inngest/sync-function.js:12:5)'),
  }));
  console.log('✓ Error alert sent');

  console.log('\nDone. Check the OVO - ALERTS Telegram group.');
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
