import { client } from '$lib/redis';
import { get } from '@edge37/redis-utils';
import type { RequestHandler } from './$types';
import type { V } from '@edge37/redis-utils/dist/types';
import { PREFIX } from '$lib/constants';
import { openai } from '$lib/openai';
import { error, text } from '@sveltejs/kit';
import { handle_server_error } from '$lib/handle_server_error';

export const POST: RequestHandler = async ({ request, params }) => {
	const id = await request.text();
	const local_input = await get<V>(client, PREFIX.concat(params.id), ['$.input']).catch((e) =>
		handle_server_error(e)
	);
	const remote_input = await get<V>(client, PREFIX.concat(id), ['$.input']).catch((e) =>
		handle_server_error(e)
	);
	return text(
		await openai
			.createChatCompletion({
				model: 'gpt4',
				messages: [
					{
						role: 'user',
						content: `The following are descriptions of 2 users of an online video chat platform. Highlight the most prominent similarities between the descriptions.
				\\n\\n***FIRST_USER_DESCRIPTION***\\n${local_input}\\n***FIRST_USER_DESCRIPTION_END***
				\\n\\n***SECOND_USER_DESCRIPTION***\\n${remote_input}\\n***SECOND_USER_DESCRIPTION_END***`
					}
				]
			})
			.then((r) => {
				// if (!r.data.choices.length || !r.data.choices[0].message) throw error(500, 'Unexpected result while getting description similarity') //TODO response
				return r.data.choices[0].message?.content ?? '';
			})
	);
};
