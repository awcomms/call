import { client } from '$lib/util/redis';
import { search } from '$lib/util/search';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const peer_id = url.searchParams.get('id');
	if (!peer_id) throw error(400, `No id provided`);
	const v = await client.hGet(peer_id, 'v');
	if (!v) {
		throw error(404, `user with peer_id ${peer_id} not found`);
	}
	const results = await search({ index: 'call', search: { v } });
	return json(results.documents);
};
