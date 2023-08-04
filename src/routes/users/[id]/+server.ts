import { client } from '@edge37/redis-utils';
import { embedding_model } from '$lib/constants';
import type { RequestHandler } from './$types';
import { openai } from '$lib/openai';

export const DELETE: RequestHandler = async ({ params }) => {
	global.client = await client.connect();
	await global.client.del(params.id);
	return new Response(null, { status: 200 });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	await global.client.json.set(
		params.id,
		'$',
		await openai
			.createEmbedding({ model: embedding_model, input: JSON.stringify(await request.json()) })
			.then((r) => {
				return r.data.data[0].embedding;
			})
	);
	return new Response(null, { status: 200 });
};
