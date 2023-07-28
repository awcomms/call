import { v_blob } from './create';
import { client } from './redis';

export const update = async ({ id, data }: { id: string; data: object }) =>
client.hSet(id, await v_blob(data));
