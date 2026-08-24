export interface Env {
	// vars:
	PUSHOVER_API_URL?: string,
	PUSHOVER_DEVICE?: string,
	BARK_API_URL?: string,

	// secrets:
	WEBHOOK_SECRET: string,
	PUSHOVER_USER_KEY: string,
	PUSHOVER_APP_TOKEN: string,
}

function maskSecret(secret: string): string {
	const length = secret.length;
	return length > 10 ? `${secret.slice(0, 4)}*** (length=${length})` : `*** (length=${length})`;
}

interface MessageContent {
	text: string,
	extra: Record<string, string>
}

type Provider = (
	request: Request,
	env: Env,
	ctx: ExecutionContext,
	message: MessageContent,
) => Promise<Response | undefined>;

const pushover: Provider = async (request, env, ctx, message) => {
	if (!env.PUSHOVER_USER_KEY)
		return new Response('Missing environment variable: PUSHOVER_USER_KEY', {status: 500});
	if (!env.PUSHOVER_APP_TOKEN)
		return new Response('Missing environment variable: PUSHOVER_APP_TOKEN', {status: 500});

	console.debug('Pushover secrets:', {
		PUSHOVER_USER_KEY: maskSecret(env.PUSHOVER_USER_KEY),
		PUSHOVER_APP_TOKEN: maskSecret(env.PUSHOVER_APP_TOKEN),
	});

	const body: Record<string, unknown> = {
		token: env.PUSHOVER_APP_TOKEN,
		user: env.PUSHOVER_USER_KEY,
		device: env.PUSHOVER_DEVICE,
		...message.extra,
		message: message.text,
	};

	const url = env.PUSHOVER_API_URL ?? 'https://api.pushover.net/1/messages.json';
	console.debug('Pushover API URL:', url);

	// pushover API doc: https://pushover.net/api
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
		console.log(`Pushover response: ${response.status} ${response.statusText}`);
	} catch (error) {
		console.log(error)
	}
};

const bark: Provider = async (request, env, ctx, message) => {
	const body: Record<string, unknown> = {
		...message.extra,
		body: message.text,
	};

	const url = env.BARK_API_URL ?? 'https://api.day.app/push';
	console.debug('Bark API URL:', url);

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
		console.log(`Bark response: ${response.status} ${response.statusText}`);
	} catch (error) {
		console.log(error)
	}
};

const providers = {pushover, bark};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

		if (env.WEBHOOK_SECRET && request.headers.get("cf-webhook-auth") !== env.WEBHOOK_SECRET) {
			return new Response(":(", {
				headers: {'content-type': 'text/plain'},
				status: 401
			})
		}

		const message: MessageContent = {
			text: (await request.json<{ text: string }>()).text?.trim() ?? '<EMPTY>',
			extra: {}
		};
		// load from search params
		new URL(request.url).searchParams.forEach((v, k) => message.extra[k] = v);

		const errorResponse = await providers.pushover(request, env, ctx, message);
		if (errorResponse)
			return errorResponse;

		return new Response(":)", {
			headers: {'content-type': 'text/plain'},
		})
	},
};
