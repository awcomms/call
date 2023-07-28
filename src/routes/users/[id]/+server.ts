import { client } from '$lib/util/redis';
import { v_blob } from '$lib/util/v_blob';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params }) => {
	await client.del(params.id);
	return new Response(null, { status: 200 });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	await client.hSet(params.id, { ...(await v_blob(await request.json())) });
	return new Response(null, { status: 200 });
};
