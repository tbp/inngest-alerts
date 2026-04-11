# inngest-alerts

Telegram alerts for [Inngest](https://www.inngest.com) functions — notifies on terminal errors and cancellations.

- **Errors:** fires only on the final attempt (after all retries exhausted) — no spam
- **Cancellations:** listens to `inngest/function.cancelled` system event
- **Safe:** never throws, no-op when env vars are missing (dev-friendly)

## Installation

```bash
npm install github:tbp/inngest-alerts#v1.0.0 --legacy-peer-deps
```

> **Note:** `--legacy-peer-deps` is required because npm's peer dependency resolver
> may fail to match the `inngest@^4` peer when installed from a git source.
> The packages are fully compatible.

## Setup

### 1. Environment variables

Add to your `.env`:

```
TELEGRAM_BOT_TOKEN=<your bot token>
TELEGRAM_CHAT_ID=<supergroup chat id, e.g. -1003697954818>
```

> **Note:** For Telegram supergroups the `chat_id` starts with `-100`. You can get it
> by calling `getUpdates` after adding your bot to the group as an admin.

### 2. Inngest client

```js
// src/inngest/client.js
const { Inngest } = require('inngest');
const { InngestTelegramAlerts } = require('inngest-alerts');

const inngest = new Inngest({
  id: 'my-app',
  middleware: [InngestTelegramAlerts],
});

module.exports = { inngest };
```

### 3. Serve handler

```js
// src/server.js
const { serve } = require('inngest/express');
const { inngest } = require('./inngest/client');
const { myFunction } = require('./inngest/my-function');
const { createCancelledAlertsFunction } = require('inngest-alerts');

app.use(
  '/api/inngest',
  serve({
    client: inngest,
    functions: [
      myFunction,
      createCancelledAlertsFunction(inngest),
    ],
  })
);
```

#### Filter by specific function ids

If you want cancellation alerts only for specific functions:

```js
createCancelledAlertsFunction(inngest, {
  functionIds: ['my-app-my-function-id'],
})
```

The `functionId` format is `{appId}-{fnId}` (slugified with hyphens, as Inngest generates it).

## Alert format

### Error

```
🔴 ОШИБКА — catalog-sync-daily

Сервис: catalog-sync
Функция: catalog-sync-daily
Попытка: финальная (ретраи исчерпаны)

Ошибка:
TypeError: Cannot read properties of undefined

Время: 11.04.2026 06:01:23 MSK
```

### Cancellation

```
🟡 ОТМЕНА — catalog-sync-daily

Сервис: catalog-sync
Функция: catalog-sync-daily
Run ID: 01JDJ…

Причина:
function cancelled

Время: 11.04.2026 06:01:23 MSK
```

## Testing

```bash
TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHAT_ID=yyy node test/send-test-alert.js
```

## Requirements

- Node >= 20
- `inngest` ^4 (peer dependency)
