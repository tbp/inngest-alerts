'use strict';

const { InngestTelegramAlerts } = require('./middleware');
const { createCancelledAlertsFunction } = require('./cancelled');
const { sendTelegram } = require('./lib/telegram');
const { formatError, formatCancelled } = require('./lib/format');

module.exports = {
  InngestTelegramAlerts,
  createCancelledAlertsFunction,
  // Exposed for custom use (e.g. manual alerts from application code)
  sendTelegram,
  formatError,
  formatCancelled,
};
