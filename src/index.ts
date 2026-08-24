export interface Env {
	// vars:
	PUSHOVER_API_URL: string,

	// secrets:
	WEBHOOK_SECRET: string,
	PUSHOVER_USER_KEY: string,
	PUSHOVER_APP_TOKEN: string,
}

function maskSecret(secret: string): string {
	const length = secret.length;
	return length > 10 ? `${secret.slice(0, 4)}*** (length=${length})` : `*** (length=${length})`;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

		if (env.WEBHOOK_SECRET && request.headers.get("cf-webhook-auth") !== env.WEBHOOK_SECRET) {
			return new Response(":(", {
				headers: {'content-type': 'text/plain'},
				status: 401
			})
		}

		if (!env.PUSHOVER_USER_KEY)
			return new Response('Missing environment variable: PUSHOVER_USER_KEY', {status: 500});
		if (!env.PUSHOVER_APP_TOKEN)
			return new Response('Missing environment variable: PUSHOVER_APP_TOKEN', {status: 500});

		console.debug('Pushover secrets:', {
			PUSHOVER_USER_KEY: maskSecret(env.PUSHOVER_USER_KEY),
			PUSHOVER_APP_TOKEN: maskSecret(env.PUSHOVER_APP_TOKEN),
		});

		let body: any = {
			token: env.PUSHOVER_APP_TOKEN,
			user: env.PUSHOVER_USER_KEY,
		};

		// load from search params
		// user / token can be overridden
		new URL(request.url).searchParams.forEach((v, k) => body[k] = v);

		// override message
		body.message = (await request.json<{ text: string }>()).text ?? '<EMPTY>';

		// pushover API doc: https://pushover.net/api
		try {
			const response = await fetch(env.PUSHOVER_API_URL, {
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

		return new Response(":)", {
			headers: {'content-type': 'text/plain'},
		})
	},
};
