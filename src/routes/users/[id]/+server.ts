import { embedding_model, PREFIX } from '$lib/constants';
import type { RequestHandler } from './$types';
import { openai } from '$lib/openai';
import { client } from '$lib/redis';
import { error, text } from '@sveltejs/kit';
import type { Gender } from '$lib/types';

export const DELETE: RequestHandler = async ({ params }) => {
	return client
		.del(PREFIX.concat(params.id))
		.catch((e) => {
			console.error(e);
			throw error(500);
		})
		.then((res) => {
			console.log(`redis del ${params.id} res`, res);
			if (res) {
				return new Response(null, { status: 204 });
			} else {
				throw error(404);
			}
		});
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const {gender, search_gender, description}: {gender: Gender, search_gender: Gender, description: string} = await request.json();
	await client.json
		.set(PREFIX.concat(params.id), '$', {
			// v: await openai
			// 	.createEmbedding({ model: embedding_model, input: description })
			// 	.then((r) => {
			// 		console.log(r)
			// 		return r.data.data[0].embedding;
			// 	})
			// 	.catch((e) => {
			// 		console.error(e.toString());
			// 		throw error(500);
			// 	}),
			description, gender, search_gender
		})
		.catch((e) => {
			console.error('PUT users/{id} error: ', e.toString());
			throw error(500);
		});
	return new Response(null, { status: 200 });
};
