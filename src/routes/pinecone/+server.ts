import { index } from '$lib/pinecone';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type Act = 'delete1' | 'describeIndexStats' | 'fetch' | 'query' | 'update' | 'upsert';

export const POST = (async ({ request }) => {
	const req = await request.json();
	console.log('req: ', req);
	const act: Act = req.act;
	let rqe;
	if (act === 'fetch' || 'delete1') {
		console.log('fd', act)
		rqe = index[act](...req.arg);
	} else {
		rqe = index[act](req.arg);
	}
	return await rqe
		.then((res) => {
			console.log('res: ', res);
			if (res.statusText !== 'OK') {
				console.log('error*: ', res.data);
				throw error(500, JSON.stringify(res.data));
			}
			console.log('sr', res);
			return json(res);
		})
		.catch((e) => {
			console.log('fetch error: ', `\`\`\`${e}\`\`\``);
			console.dir('fetch error: req: ', `\`\`\`${req}\`\`\``);
			throw error(500, JSON.stringify(e));
		});
}) satisfies RequestHandler;
