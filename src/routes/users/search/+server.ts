import type { RequestHandler } from './$types';
import { error, json, text } from '@sveltejs/kit';
import { client, search, get } from '@edge37/redis-utils';
import type { V } from '@edge37/redis-utils/dist/types';

export const GET: RequestHandler = async ({ url }) => {
	global.client = await client.connect();
	const peer_id = url.searchParams.get('id');
	if (!peer_id) throw error(400, `No id provided`);
	const v = await get<V>(peer_id, ['$'], true);
	console.log('v', v)
	if (!v) {
		throw error(404, `user with peer_id ${peer_id} not found`);
	}
	const results = await search({ index: 'call', search: { v } });
	if (results.documents.length < 2) return text('')
	console.log(results.documents)
	return json(results.documents[1].id);
};
