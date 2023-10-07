import { error } from '@sveltejs/kit';

interface CustomError {
	s: number;
	m: string;
}

export const handle_server_error = (m: string | Request, e?: unknown, debug?: string) => {
	const d = e.s || e.m;
	if (!d) {
		let r: string;
		if (typeof m === 'string') {
			r = m;
		} else {
			r = `${m.method} ${m.url}`;
		}
		console.error(r, e ?? '', debug ?? '');
	}
	return d ? error((e as CustomError)?.s ?? 500, (e as CustomError)?.m ?? undefined) : error(500);
};
