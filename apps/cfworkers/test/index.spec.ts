import { createExecutionContext } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import worker from '../src/index';

const payload = { id: 'site', userId: 'user', url: 'https://example.com', regions: [{ regionId: 'region', regionCode: 'SFO' }] };
const call = (body: unknown, env: { CHECK_SECRET?: string } = {}) =>
	worker.fetch(
		new Request('https://checker.test/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
		}),
		env,
		createExecutionContext(),
	);
afterEach(() => vi.unstubAllGlobals());

describe('HTTP checker', () => {
	it('records successful HEAD checks', async () => {
		const mock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
		vi.stubGlobal('fetch', mock);
		expect(((await (await call(payload)).json()) as any).checks[0]).toMatchObject({ status: 'UP', statusCode: 200 });
		expect(mock).toHaveBeenCalledTimes(1);
	});
	it('falls back to GET when HEAD is unsupported', async () => {
		const mock = vi
			.fn()
			.mockResolvedValueOnce(new Response(null, { status: 405 }))
			.mockResolvedValueOnce(new Response('ok', { status: 200 }));
		vi.stubGlobal('fetch', mock);
		expect(((await (await call(payload)).json()) as any).checks[0]).toMatchObject({ status: 'UP', statusCode: 200 });
		expect(mock.mock.calls.map((args) => args[1].method)).toEqual(['HEAD', 'GET']);
	});
	it('falls back to GET for 501 responses', async () => {
		const mock = vi
			.fn()
			.mockResolvedValueOnce(new Response(null, { status: 501 }))
			.mockResolvedValueOnce(new Response('ok', { status: 200 }));
		vi.stubGlobal('fetch', mock);
		expect(((await (await call(payload)).json()) as any).checks[0]).toMatchObject({ status: 'UP', statusCode: 200 });
		expect(mock.mock.calls.map((args) => args[1].method)).toEqual(['HEAD', 'GET']);
	});
	it('uses one deadline across HEAD and GET', async () => {
		const mock = vi
			.fn()
			.mockImplementationOnce(async () => {
				await new Promise((resolve) => setTimeout(resolve, 15));
				return new Response(null, { status: 405 });
			})
			.mockImplementationOnce(
				(_url, options) =>
					new Promise((_resolve, reject) => {
						if (options.signal.aborted) return reject(new Error('timeout'));
						options.signal.addEventListener('abort', () => reject(new Error('timeout')));
					}),
			);
		vi.stubGlobal('fetch', mock);
		expect(((await (await call({ ...payload, timeout: 30 })).json()) as any).checks[0]).toMatchObject({ status: 'DOWN', error: 'timeout' });
	});
	it('records unsuccessful HTTP responses', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
		expect(((await (await call(payload)).json()) as any).checks[0]).toMatchObject({ status: 'DOWN', statusCode: 503 });
	});
	it('rejects invalid and unauthorized requests', async () => {
		expect((await call({})).status).toBe(400);
		expect((await call(payload, { CHECK_SECRET: 'secret' })).status).toBe(401);
	});
	it('records timeout as down', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(
				(_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('timeout')))),
			),
		);
		expect(((await (await call({ ...payload, timeout: 10 })).json()) as any).checks[0]).toMatchObject({ status: 'DOWN', error: 'timeout' });
	});
});
