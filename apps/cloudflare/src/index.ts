interface CheckRequest {
	url: string;
	websiteId: string;
	regionId: string;
	regionCode: string;
	timeout: number;
	userPlan: string;
}

interface CheckResult {
	websiteId: string;
	regionId: string;
	status: 'UP' | 'DOWN' | 'UNKNOWN';
	responseTime: number;
	statusCode?: number;
	error?: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		try {
			const data: CheckRequest = await request.json();

			if (!data.url || !data.websiteId || !data.regionId) {
				return new Response('Missing required fields', { status: 400 });
			}

			await env.CHECK_QUEUE.send(data);

			return new Response(
				JSON.stringify({
					status: 'queued',
					message: `Check for ${data.url} enqueued successfully`,
				}),
				{
					headers: { 'Content-Type': 'application/json' },
				},
			);
		} catch (err) {
			return new Response(`Error: ${(err as Error).message}`, { status: 500 });
		}
	},

	async queue(batch: MessageBatch<unknown>, env: Env, ctx: ExecutionContext): Promise<void> {
		const results: CheckResult[] = [];

		await Promise.all(
			batch.messages.map(async (message) => {
				const start = Date.now();

				const data = message.body as CheckRequest;

				const result: CheckResult = {
					websiteId: data.websiteId,
					regionId: data.regionId,
					status: 'UNKNOWN',
					responseTime: 0,
				};

				try {
					const controller = new AbortController();
					const timeout = setTimeout(() => controller.abort(), Math.min(data.timeout, 30000));

					const init: RequestInit = {
						method: 'HEAD',
						redirect: 'follow',
						signal: controller.signal,
						cf: {
							colo: data.regionCode || 'default',
							cacheTtl: 0,
						},
					};

					const response = await fetch(data.url, init);
					clearTimeout(timeout);

					result.status = response.ok ? 'UP' : 'DOWN';
					result.statusCode = response.status;
				} catch (error: any) {
					result.status = 'DOWN';
					result.error = error.message || 'Request failed';
				}

				result.responseTime = Date.now() - start;
				results.push(result);
				message.ack();
			}),
		);

		if (results.length > 0) {
			try {
				await fetch(env.RESULT_WEBHOOK, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(results),
				});
			} catch (err) {
				console.error('Failed to send results:', err);
			}
		}
	},
} satisfies ExportedHandler<Env>;

interface Env {
	CHECK_QUEUE: Queue;
	RESULT_WEBHOOK: string;
}
