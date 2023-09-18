import { handle_server_error } from '$lib/handle_server_error';
import { client } from '$lib/redis';
import type { RequestHandler } from './$types';
import { verify } from "@edge37/paystack-utils";

export const PUT: RequestHandler = async ({ request, params }) => {
	const { reference, count } = await request.json();
	try {
		// if (await verify(reference)) {
			client.json.set(params.id, '$.tokens', count);
			return new Response('.', {status: 200});
        // } else {
        //     return new Response('', {status: 200})
        // }
	} catch (e: any) {
		throw handle_server_error(`PUT /users/${params.id}/tokens. reference: ${reference}`, e);
	}
};
