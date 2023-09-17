import type { RequestHandler } from './$types';
import { error, text } from '@sveltejs/kit';
import { search, get } from '@edge37/redis-utils';
import type { V } from '@edge37/redis-utils/dist/types';
import { client } from '$lib/redis';
import { PREFIX, index } from '$lib/constants';
import type { Gender } from '$lib/types';
import { AggregateOptions } from 'redis';

export const GET: RequestHandler = async ({ url }) => {
	/**
	 * if gender is
	 *
	 */
	const peer_id = url.searchParams.get('id');
	const use_position = url.searchParams.get('use_position');
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
	const { gender, search_gender, position } = await get<{
		gender: Gender;
		search_gender: Gender;
		position: string;
	}>(client, id, [
		// '$.v',
		'$.search_gender',
		'$.gender',
		'$.position'
	]).catch((e) => {
		console.error(e);
		throw error(500);
	});
	// console.log('--v', v)
	// if (!v) {
	// 	text(`no_description`);
	// }
	// const results = await search(client, {
	// 	index,
	// 	// search: v,
	// 	filters: [
	// 		{ type: 'text', field: 'gender', value: search_gender },
	// 		{ type: 'text', field: 'search_gender', value: gender }
	// 	]
	// }).catch((e) => {
	// 	console.error(e);
	// 	throw error(500);
	// });
	const STEPS: AggregateOptions.STEPS = [
		// { expression: `@gender==${search_gender} && @search_gender==${gender}` }
	];
	if (use_position && position) {
		// STEPS.push({ expression: 'exists(@position)' });
		// STEPS.push({ expression: `geodistance(@position,"${position}"`, AS: 'dist' });
		// if (!isNaN(+use_position) && +use_position > 0) {
		// 	STEPS.push({ expression: `@dist<=${+use_position * 1609.34}` });
		// }
		// STEPS.push({ BY: { BY: '@dist', DIRECTION: 'ASC' } });
	}

	try {
		const { results, total } = await client.ft.aggregate(index, '*',
		// 	{
		// 	STEPS
		// }
		);
		console.log(results, total);
		console.log('s', await client.ft.search(index, '*'))
		return text('');
	} catch (e: any) {
		throw error(500);
	}
	// let match = results.documents.filter((d) => d.id !== id)[0];
	// if (!match) return text('no_users');
	// return text(match.id.split(PREFIX)[1]);
};
