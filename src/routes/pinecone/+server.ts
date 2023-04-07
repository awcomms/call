import { index } from '$lib/pinecone';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const req = await request.json();
	return await index[req.act](req.arg || {})
		.then((res) => {
			if (res.statusText !== 'OK') {
				throw error(500, JSON.stringify(res.data));
			}
			return json(res);
		})
}) satisfies RequestHandler;
