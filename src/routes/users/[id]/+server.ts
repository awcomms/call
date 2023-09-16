import { embedding_model, PREFIX } from '$lib/constants';
import type { RequestHandler } from './$types';
// import { openai } from '$lib/openai';
import { client } from '$lib/redis';
import { error } from '@sveltejs/kit';
import { handle_server_error } from '$lib/handle_server_error';

export const DELETE: RequestHandler = async ({ params }) => {
	return client
		.del(PREFIX.concat(params.id))
		.catch((e) => {
			handle_server_error('PUT users/{id} error: ', e);
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
	let id = PREFIX.concat(params.id);
	const args = await request.json();
	try {
		if (!(await client.exists(id))) {
			try {
				client.json.set(id, '$', args);
			} catch (e: any) {
				handle_server_error('PUT users/{id} error: ', e);
			}
		} else {
			for (let key of Object.keys(args)) {
				try {
					await client.json.set(id, `$.${key}`, args[key]);
				} catch (e: any) {
					handle_server_error('PUT users/{id} error: ', e);
					throw error(500);
				}
			}
		}
	} catch (e: any) {
		handle_server_error('PUT users/{id} error: ', e);
	}

	return new Response();
};
