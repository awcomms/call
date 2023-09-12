import type { RequestHandler } from './$types';
import { error, text } from '@sveltejs/kit';
import { search, get } from '@edge37/redis-utils';
import type { V } from '@edge37/redis-utils/dist/types';
import { client } from '$lib/redis';
import { PREFIX, index } from '$lib/constants';
import type { Gender } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	/**
	 * if gender is
	 *
	 */
	const peer_id = url.searchParams.get('id');
	if (!peer_id) throw error(400, `No peer id provided`);
	const id = PREFIX.concat(peer_id);
	if (
		!(await client.exists(id).catch((e) => {
			console.error(e);
			throw error(500);
		}))
	) {
		throw error(404, `user with peer_id ${peer_id} not found`);
	}
	const { gender, search_gender } = await get<{gender: Gender, search_gender: Gender}>(client, id, [
		// '$.v',
		'$.search_gender',
		'$.gender'
	]).catch((e) => {
		console.error(e);
		throw error(500);
	});
	// console.log('--v', v)
	// if (!v) {
	// 	text(`no_description`);
	// }
	const results = await search(client, {
		index,
		// search: v,
		filters: [{type: 'text', field: 'gender', value: search_gender}, {type: 'text', field: 'search_gender', value: gender}]
	}).catch((e) => {
		console.error(e);
		throw error(500);
	});
	console.log(results);
	let match = results.documents.filter((d) => d.id !== id)[0];
	if (!match) return text('no_users');
	return text(match.id.split(PREFIX)[1]);
};
