import { embedding_model, PREFIX } from '$lib/constants';
import type { RequestHandler } from './$types';
// import { openai } from '$lib/openai';
import { client } from '$lib/redis';
import { error } from '@sveltejs/kit';

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
	let id = PREFIX.concat(params.id)
	const args = await request.json();
	for (let key of Object.keys(args)) {
		try { await client.json.set(id, `$.${key}`, args[key]) } catch (e: any) {
			console.error('PUT users/{id} error: ', e.toString());
			throw error(500);
		}
	}
	return new Response();
};
