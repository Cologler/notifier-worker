# notifier-worker

Forward Cloudflare notifications to pushover with Cloudflare worker.

## How to use

### Pushover

1. Clone the repo and run `pnpm i`;
2. Run `pnpm run deploy`;
3. Log in to https://pushover.net/ and copy your user key;
4. Register an app at https://pushover.net/apps/build and copy its app token;
5. In your Cloudflare dashboard, set `PUSHOVER_USER_KEY` and `PUSHOVER_APP_TOKEN` as secrets, or add `user` and `token` query parameters to the Webhook URL. Leave `PROVIDER` unset or set it to `pushover`;
6. Optionally, set `WEBHOOK_SECRET` as a secret;
7. Add a Webhook on your Cloudflare notifications page. Use your Worker's URL and, if configured, the same value as `WEBHOOK_SECRET` for the optional secret;

### Bark

1. Clone the repo and run `pnpm i`;
2. Run `pnpm run deploy`;
3. Open Bark and copy the device key from its test URL;
4. In your Cloudflare dashboard, set `PROVIDER` to `bark` and `BARK_API_URL` to `https://api.day.app/<device-key>`;
5. Optionally, set `WEBHOOK_SECRET` as a secret;
6. Add a Webhook on your Cloudflare notifications page. Use your Worker's URL and, if configured, the same value as `WEBHOOK_SECRET` for the optional secret;

### Environment variables

#### Shared

| Variable | Description | Default |
| --- | --- | --- |
| `WEBHOOK_SECRET` | Validates the `cf-webhook-auth` request header when set. | Authentication disabled |
| `PROVIDER` | Selects the notification provider: `pushover` or `bark`. | `pushover` |

#### Pushover

| Variable | Description | Default |
| --- | --- | --- |
| `PUSHOVER_USER_KEY` | Pushover user or group key. | `user` query parameter |
| `PUSHOVER_APP_TOKEN` | Pushover application API token. | `token` query parameter |
| `PUSHOVER_DEVICE` | Limits delivery to the named device, or comma-separated devices. | All active devices |
| `PUSHOVER_API_URL` | Overrides the Pushover API endpoint. | `https://api.pushover.net/1/messages.json` |

#### Bark

| Variable | Description | Default |
| --- | --- | --- |
| `BARK_API_URL` | Overrides the Bark API endpoint for the Bark provider. | `https://api.day.app/push` |

### Many user to one worker

Every query parameter on the Worker URL is copied to the selected provider's request body. This lets different Cloudflare Webhooks use different recipients or delivery options without deploying another Worker.

For Pushover, parameters such as `user`, `token`, and `device` override the configured request fields, while fields such as `title`, `priority`, and `sound` pass through to Pushover. `PUSHOVER_USER_KEY` and `PUSHOVER_APP_TOKEN` may be omitted when `user` and `token` are supplied as query parameters. The `message` field always comes from the Cloudflare notification's `text` and cannot be overridden by a query parameter.

For Bark, use `device_key` to select a device and parameters such as `title`, `group`, and `sound` to set notification options. The `body` field always comes from the Cloudflare notification's `text` and cannot be overridden by a query parameter.

Query parameters do not change `PROVIDER`, `PUSHOVER_API_URL`, `BARK_API_URL`, or `WEBHOOK_SECRET`.
