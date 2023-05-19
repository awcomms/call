import { index } from '$lib/pinecone';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { AxiosResponse } from 'axios';

type Act = '_delete' | 'describeIndexStats' | 'fetch' | 'query' | 'update' | 'upsert';

export const POST = (async ({ request }) => {
	const req = await request.json();
	const act: Act = req.act;
	return await index[act](req.arg)
		.then((res: AxiosResponse) => {
			// if (res.statusText !== 'OK') {
			// 	console.log('error*: ', res.data);
			// 	throw error(500, JSON.stringify(res.data));
			// }
			return json(res);
		})
		.catch((e) => {
			console.log('fetch error', e);
			console.log('req: ', req);
			throw error(500, JSON.stringify(e));
		})
		.finally(() => {
			console.log('\n---finally---\n');
		});
}) satisfies RequestHandler;
