import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '$env/static/private';
import {createClient } from 'redis';
import { setup } from './setup';

export const client = createClient({
	password: REDIS_PASSWORD,
	socket: {
		host: REDIS_HOST,
		port: Number(REDIS_PORT)
	}
});

await client.connect().catch((e) => console.error('redis client.connect', e));
client.on('error', (e) => console.error('redis client error:', e));

await setup()