import { openai } from '$lib/openai';
import { error, json, type RequestHandler } from '@sveltejs/kit';

const model = 'text-embedding-ada-002';

export const POST = (async ({ request }) => {
	return openai.createEmbedding({ model, input: await request.text() }).then((res) => {
		if (res.statusText !== 'OK') {
			throw error(500, JSON.stringify(res.data));
		}
		return json(res.data.data[0].embedding);
	});
}) satisfies RequestHandler;
