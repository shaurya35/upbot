interface CheckRequest {
	url: string;
	websiteId: string;
	regionId: string;
	regionCode: string;
	timeout: number;
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
	async fetch(request: Request): Promise<Response> {
		if (request.method !== 'POST') {
			return new Response('Method not allowed', { status: 405 });
		}

		let data: CheckRequest;
		try {
			data = await request.json();
		} catch {
			return new Response('Invalid JSON', { status: 400 });
		}

		if (!data.url || !data.websiteId || !data.regionId || !data.regionCode) {
			return new Response('Missing required fields', { status: 400 });
		}

		const start = Date.now();
		const result: CheckResult = {
			websiteId: data.websiteId,
			regionId: data.regionId,
			status: 'UNKNOWN',
			responseTime: 0,
		};

		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), data.timeout || 10000);

			const response = await fetch(data.url, {
				method: 'HEAD',
				redirect: 'follow',
				signal: controller.signal,
				cf: { colo: data.regionCode },
			});

			clearTimeout(timeout);
			result.status = response.ok ? 'UP' : 'DOWN';
			result.statusCode = response.status;
		} catch (error: any) {
			result.status = 'DOWN';
			result.error = error.message || 'Request failed';
		}

		result.responseTime = Date.now() - start;

		return new Response(JSON.stringify(result), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store',
			},
		});
	},
};
