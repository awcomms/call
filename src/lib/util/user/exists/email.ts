import { user_index } from '$lib/constants';
import type { EscapedEmail } from '$lib/types';
import { client } from '$lib/redis';

export const email = async (email: EscapedEmail) => {
	const res = await client.ft.search(user_index, `@email:"${email.value}"`, {
		LIMIT: { from: 0, size: 0 }
	});
	return res.total;
};
