import { embedding_model, PREFIX } from '$lib/constants';
import type { RequestHandler } from './$types';
import { openai } from '$lib/openai';
import { client } from '$lib/redis';
import { error } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params }) => {
	return client.del(PREFIX.concat(params.id)).catch((e) => {
		console.error(e);
		throw error(500);
	}).then(res => {
		// console.log(`redis del ${params.id} res`, res)
		return new Response(null, { status: 200 });

	});
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const input = await request.text();
	console.log('i_set', input);
	await client.json
		.set(PREFIX.concat(params.id), '$', {
			v: await openai
				.createEmbedding({ model: embedding_model, input })
				.then((r) => {
					return r.data.data[0].embedding;
				})
				.catch((e) => {
					console.error(e);
					throw error(500);
				}),
			input
		})
		.catch((e) => {
			console.error(e);
			throw error(500);
		});
	return new Response(null, { status: 200 });
};
