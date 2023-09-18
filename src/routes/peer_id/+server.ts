import { text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { client } from '$lib/redis';
import { handle_server_error } from '$lib/handle_server_error';
import { build_id } from '$lib/build_id';

export const GET: RequestHandler = async () =>
	client
		.incr('current_peer_id')
		.then((r) => text(build_id(r)))
		.catch((e) => {
			throw handle_server_error('/peer_id error:', e);
		});
