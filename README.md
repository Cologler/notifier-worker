# cf-notifications to pushover

Forward Cloudflare notifications to pushover with Cloudflare worker.

## How to use

1. Clone the repo;
2. Run `pnpm i` in your terminal;
3. Run `pnpm run deploy` in your terminal;
4. log in to your pushover, you can find your user key at https://pushover.net/;
5. Register your app on https://pushover.net/apps/build, you will find your app token;
7. Go to your Cloudflare dash, and set up environment variables `PUSHOVER_APP_TOKEN` and `PUSHOVER_USER_KEY` (hide is recommended);
8. If you wish, you can set up environment variables `WEBHOOK_SECRET` (hide is recommended);
9. Go to your Cloudflare notifications page and add the Webhook. The `URL` is your worker's URL and the optional secret should be the same as `WEBHOOK_SECRET`;
10. It should work now;

### Environment variables

#### Shared

| Variable | Description | Default |
| --- | --- | --- |
| `WEBHOOK_SECRET` | Validates the `cf-webhook-auth` request header when set. | Authentication disabled |

#### Pushover

| Variable | Description | Default |
| --- | --- | --- |
| `PUSHOVER_USER_KEY` | Pushover user or group key. | Required |
| `PUSHOVER_APP_TOKEN` | Pushover application API token. | Required |
| `PUSHOVER_API_URL` | Overrides the Pushover API endpoint. | `https://api.pushover.net/1/messages.json` |

#### Bark

| Variable | Description | Default |
| --- | --- | --- |
| `BARK_API_URL` | Overrides the Bark API endpoint for the Bark provider. | `https://api.day.app/push` |

The worker currently uses the Pushover provider by default. Provider selection will be added separately.

### Many user to one worker

1. You can override it with URL search params;
