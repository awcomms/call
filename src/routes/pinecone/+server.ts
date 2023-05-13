import { index } from '$lib/pinecone';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type Act = '_delete' | 'describeIndexStats' | 'fetch' | 'query' | 'update' | 'upsert';

export const POST = (async ({ request }) => {
	const req = await request.json();
	console.log('req: ', req)
	const act: Act = req.act;
	return await index[act](req.arg)
		.then((res) => {
			console.log('res: ', res);
			// if (res.statusText !== 'OK') {
			// 	console.log('error*: ', res.data)
			// 	throw error(500, JSON.stringify(res.data));
			// }
			console.log('sr', res)
			return json(res);
		})
		// .catch((e) => {
		// 	console.log('error: ', `\`\`\`${e}\`\`\``);
		// 	console.dir('req: ', `\`\`\`${req}\`\`\``);
		// 	throw error(500, 'Internal Server Error');
		// })
}) satisfies RequestHandler;
