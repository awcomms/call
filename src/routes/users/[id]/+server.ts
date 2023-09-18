import { embedding_model, index, PREFIX } from '$lib/constants';
import type { RequestHandler } from './$types';
// import { openai } from '$lib/openai';
import { client } from '$lib/redis';
// import { writeFileSync } from 'fs';
import { float32_buffer } from 'sveltekit-carbon-utils';
import { handle_server_error } from '$lib/handle_server_error';
import { openai } from '$lib/openai';
import { dev } from '$app/environment';

// export const DELETE: RequestHandler = async ({ params }) => {
// 	return client
// 		.del(PREFIX.concat(params.id))
// 		.catch((e) => {
// 			throw handle_server_error('PUT users/{id} error: ', e);
// 		})
// 		.then((res) => {
// 			console.log(`redis del ${params.id} res`, res);
// 			if (res) {
// 				return new Response(null, { status: 204 });
// 			} else {
// 				throw error(404);
// 			}
// 		});
// };

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		let id = PREFIX.concat(params.id);
		const args = await request.json();
		if (args.text) {
			const v = await openai.createEmbedding({ model: embedding_model, input: args.text });
			args.v = float32_buffer(v.data.data[0].embedding);
			// writeFileSync('sample_embedding.json', JSON.stringify(v.data));
		}
		if (!(await client.exists(id))) {
			client.json.set(id, '$', args);
		} else {
			for (let key of Object.keys(args)) {
				await client.json.set(id, `$.${key}`, args[key]);
			}
		}
		return new Response();
	} catch (e: any) {
		throw handle_server_error('PUT users/{id} error: ', e);
	}
};
