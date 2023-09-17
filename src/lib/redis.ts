import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '$env/static/private';
import { SchemaFieldTypes, VectorAlgorithms, createClient } from 'redis';
import { PREFIX, index } from './constants';

export const client = createClient({
	password: REDIS_PASSWORD,
	socket: {
		host: REDIS_HOST,
		port: Number(REDIS_PORT)
	}
});

await client.connect().catch((e) => console.error('redis client.connect', e));
client.on('error', (e) => console.error('redis client error:', e));

// await client.flushAll()

await client.ft
	.create(
		index,
		{
			'$.v': {
				AS: 'v',
				type: SchemaFieldTypes.VECTOR,
				ALGORITHM: VectorAlgorithms.HNSW,
				TYPE: 'FLOAT32',
				DIM: 1536,
				DISTANCE_METRIC: 'COSINE'
			},
			'$.gender': {
				AS: 'gender',
				type: SchemaFieldTypes.NUMERIC,
				NOINDEX: true
			},
			'$.search_gender': {
				AS: 'search_gender',
				type: SchemaFieldTypes.NUMERIC,
				NOINDEX: true
			}
		},
		{
			ON: 'JSON',
			PREFIX
		}
	)
	.catch((e) => {
		if (e.message !== 'Index already exists') {
			console.error('client.ft.create', e);
			process.exit(1);
		}
	});

// await client.ft
// 	.alter(index, {
// 		'$.created': {
// 			AS: 'created',
// 			type: SchemaFieldTypes.NUMERIC,
// 			NOINDEX: true
// 		},
// 		'$.updated': {
// 			AS: 'updated',
// 			type: SchemaFieldTypes.NUMERIC,
// 			NOINDEX: true
// 		}
// 	})
// 	.catch((e) => console.error('ft.alter error: ', e));
