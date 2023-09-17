import { text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { client } from '$lib/redis';
import { handle_server_error } from '$lib/handle_server_error';

export const GET: RequestHandler = async () =>
	client
		.incr('current_peer_id')
		.then((r) => text(r.toString()))
		.catch((e) => {
			throw handle_server_error('/peer_id error:', e);
		});
