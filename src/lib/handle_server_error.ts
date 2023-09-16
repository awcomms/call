import { error } from '@sveltejs/kit';

export const handle_server_error = (m: string, e: Error) => {
	console.error(m, e.toString(), e.cause, e);
	return error(500);
};
