import { ids_hash } from '$lib/constants';
import { client } from './redis';
import { v_blob } from './v_blob';

const build_id = (index: string, id: number) => `${index}:${id}`;

export const create = async ({ index, data }: { index: string; data: object }) => {
	console.log('create', index, data);
	const id = await client.hIncrBy(ids_hash, index, 1);
	const item_id = build_id(index, id);
	await client.hSet(item_id, await v_blob(data));
	return item_id;
};
