import type { RequestHandler } from './$types';
import { error, text } from '@sveltejs/kit';
import { search, get } from '@edge37/redis-utils';
import type { V } from '@edge37/redis-utils/dist/types';
import { client } from '$lib/redis';
import { PREFIX, index } from '$lib/constants';

export const GET: RequestHandler = async ({ url }) => {
	const peer_id = url.searchParams.get('id');
	if (!peer_id) throw error(400, `No peer id provided`);
	const id = PREFIX.concat(peer_id);
	if (
		!(await client.exists(id).catch((e) => {
			console.error(e);
			throw error(500);
		}))
	) {
		throw error(404, `user with peer_id ${peer_id} not found`);
	}
	const v = await get<V>(client, id, ['$.v'])
		.then((r) => r[0])
		.catch((e) => {
			console.error(e);
			throw error(500);
		});
	if (!v) {
		throw error(404, `no_description`);
	}
	const results = await search(client, { index, search: v }).catch((e) => {
		console.error(e);
		throw error(500);
	});
	console.log(results);
	if (results.total < 2) throw error(404, `no_users`);
	let match = results.documents[0].id === id ? results.documents[1] : results.documents[0];
	return text(match.id.split(PREFIX)[1]);
};
