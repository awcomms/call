import { embedding_model, index, PREFIX } from '$lib/constants';
import type { RequestHandler } from './$types';
// import { openai } from '$lib/openai';
import { client } from '$lib/redis';
import { error } from '@sveltejs/kit';
import { handle_server_error } from '$lib/handle_server_error';

export const DELETE: RequestHandler = async ({ params }) => {
	return client
		.del(PREFIX.concat(params.id))
		.catch((e) => {
			throw handle_server_error('PUT users/{id} error: ', e);
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
	let id = PREFIX.concat(params.id);
	const args = await request.json();
	console.log(args);
	try {
		if (!(await client.exists(id))) {
			client.json.set(id, '$', args);
		} else {
			for (let key of Object.keys(args)) {
				await client.json.set(id, `$.${key}`, args[key]);
			}
		}
		// console.log('e', id, await client.ft.search(index, "*"))
	} catch (e: any) {
		throw handle_server_error('PUT users/{id} error: ', e);
	}

	return new Response();
};
