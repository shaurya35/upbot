type RegionRequest = {
	regionId: string;
	regionCode: string;
};

type RequestData = {
	id: string;
	url: string;
	userId: string;
	regions: RegionRequest[];
	timeout?: number;
};

function isRegionRequest(obj: unknown): obj is RegionRequest {
	if (typeof obj !== 'object' || obj === null) return false;
	const o = obj as Record<string, unknown>;
	return typeof o.regionId === 'string' && typeof o.regionCode === 'string';
}

function isRequestData(obj: unknown): obj is RequestData {
	if (typeof obj !== 'object' || obj === null) return false;
	const o = obj as Record<string, unknown>;
	return (
		typeof o.id === 'string' &&
		typeof o.url === 'string' &&
		typeof o.userId === 'string' &&
		Array.isArray(o.regions) &&
		o.regions.every(isRegionRequest) &&
		(o.timeout === undefined || typeof o.timeout === 'number')
	);
}

async function performCheck(
	url: string,
	regionCode: string,
	timeout: number,
): Promise<{
	status: 'UP' | 'DOWN' | 'UNKNOWN';
	responseTime: number;
	statusCode?: number;
	error?: string;
}> {
	const startTime = Date.now();
	const result = {
		status: 'UNKNOWN' as 'UP' | 'DOWN' | 'UNKNOWN',
		responseTime: 0,
		statusCode: undefined as number | undefined,
		error: undefined as string | undefined,
	};

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		const response = await fetch(url, {
			method: 'HEAD',
			redirect: 'follow',
			signal: controller.signal,
			cf: {
				colo: regionCode,
				cacheEverything: false,
			},
		});

		clearTimeout(timeoutId);
		result.status = response.ok ? 'UP' : 'DOWN';
		result.statusCode = response.status;
	} catch (error: unknown) {
		result.status = 'DOWN';
		result.error = error instanceof Error ? error.message : 'Request failed';
	} finally {
		result.responseTime = Date.now() - startTime;
	}

	return result;
}

export default {
	async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Max-Age': '86400',
				},
			});
		}

		if (request.method !== 'POST') {
			return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
		}

		let rawData: unknown;
		try {
			rawData = await request.json();
		} catch (err) {
			return jsonResponse({ error: 'Invalid JSON' }, 400);
		}

		if (!isRequestData(rawData)) {
			return jsonResponse({ error: 'Missing required fields or invalid region format' }, 400);
		}

		try {
			new URL(rawData.url);
		} catch {
			return jsonResponse({ error: 'Invalid URL format' }, 400);
		}

		if (!rawData.regions || rawData.regions.length === 0) {
			return jsonResponse({ error: 'At least one region is required' }, 400);
		}

		const timeout = Math.min(rawData.timeout ?? 10000, 30000);
		const checkPromises = rawData.regions.map(async (region) => {
			const checkResult = await performCheck(rawData.url, region.regionCode, timeout);

			return {
				...checkResult,
				createdAt: new Date().toISOString(),
				websiteId: rawData.id,
				regionId: region.regionId,
			};
		});

		const checks = await Promise.all(checkPromises);

		return jsonResponse({
			input: {
				id: rawData.id,
				url: rawData.url,
				userId: rawData.userId,
				regions: rawData.regions,
				timeout: rawData.timeout,
			},
			checks,
		});
	},
} satisfies ExportedHandler<Env>;

function jsonResponse(data: unknown, status = 200, headers?: HeadersInit): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store, max-age=0',
			'Access-Control-Allow-Origin': '*',
			...headers,
		},
	});
}
