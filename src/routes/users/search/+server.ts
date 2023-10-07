import type { RequestHandler } from './$types';
import { text } from '@sveltejs/kit';
import { get, search } from '@edge37/redis-utils';
import type { V } from '@edge37/redis-utils/dist/types';
import { client } from '$lib/redis';
import { PREFIX, index } from '$lib/constants';
import type { Gender } from '$lib/types';
import type { AggregateOptions } from '@redis/search/dist/commands/AGGREGATE';
import { AggregateSteps } from '@redis/search/dist/commands/AGGREGATE';
import { handle_server_error } from '$lib/handle_server_error';
import type { SearchParams } from '@edge37/redis-utils/dist/redis/search';

export const GET: RequestHandler = async ({ url, request }) => {
	try {
		const peer_id = url.searchParams.get('id');
		if (!peer_id) throw { s: 400, m: `No peer id provided` };
		const use_position = url.searchParams.get('use_position');
		const id = PREFIX.concat(peer_id);
		if (!(await client.exists(id))) {
			throw { s: 404, m: `user with peer_id ${peer_id} not found` };
		}
		const { gender, search_gender, position } = await get<{
			gender: Gender;
			search_gender: Gender;
			position: string;
			v: V;
		}>(client, id, ['$.v', '$.search_gender', '$.gender', '$.position']);
		// const STEPS: AggregateOptions["STEPS"] = [
		// { expression: `@gender==${search_gender} && @search_gender==${gender}` }
		// ];
		// if (use_position && position) {
		// [lon, lat] = position.split(',')
		// query = `@position:[${lon} ${lat}]`
		// STEPS.push({ expression: 'exists(@position)' });
		// STEPS.push({ expression: `geodistance(@position,"${position}"`, AS: 'dist' });
		// if (!isNaN(+use_position) && +use_position > 0) {
		// 	STEPS.push({ expression: `@dist<=${+use_position * 1609.34}` });
		// }
		// STEPS.push({ BY: { BY: '@dist', DIRECTION: 'ASC' } });
		// }

		// const { results, total } = await client.ft.aggregate(
		// 	index,
		// 	'*'
		// 	// 	{
		// 	// 	STEPS
		// 	// }
		// );
		// console.log('art', results, total);
		// console.log('s', await client.ft.search(index, '*'))
		let documents;
		if (use_position !== null) {
			if (!isNaN(+use_position) && +use_position > 0 && position) {
				const search_args: SearchParams = {
					query: `@search_gender:"${gender}" @gender:"${search_gender}"`,
					index,
					page: 1
				};
				const [lon, lat] = position.split(',');
				search_args.query += `@position:[${lon} ${lat}]`;
				const { v } = await get(client, id, ['$.v']);
				search_args.B = Buffer.from(new Float32Array(v).buffer);
				res = await search(client, search_args);
				console.debug('search res', res)
				({documents} = res)
			} else {
				const STEPS: AggregateOptions['STEPS'] = [
					{
						type: AggregateSteps.SORTBY,
						expression: `@gender==${search_gender} && @search_gender==${gender}`
					}
				];
				STEPS.push({ type: AggregateSteps.FILTER, expression: 'exists(@position)' });
				STEPS.push({
					type: AggregateSteps.APPLY,
					expression: `geodistance(@position,"${position}"`,
					AS: 'dist'
				});
				STEPS.push({ type: AggregateSteps.SORTBY, BY: { BY: '@dist', DIRECTION: 'ASC' } });
				({ results: documents } = await client.ft.aggregate(index, '*', { STEPS }));
				console.info('ad', documents);
			}
		}
		if (!documents) throw handle_server_error(request, { code: 500, message: 'no documents' });
		let match = documents.filter((d) => d.id !== id)[0];
		if (!match) return text('no_users');
		return text(match.id);
	} catch (e) {
		throw handle_server_error(request, e);
	}
};
