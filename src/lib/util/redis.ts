import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '$env/static/private';
import { namespace } from '$lib/constants';
import { SchemaFieldTypes, VectorAlgorithms, createClient } from 'redis';

export const client = createClient({
	password: REDIS_PASSWORD,
	socket: {
		host: REDIS_HOST,
		port: Number(REDIS_PORT)
	}
});

await client.connect();

// try {
// 	await client.ft.create(
// 		namespace,
// 		{
// 			v: {
// 				type: SchemaFieldTypes.VECTOR,
// 				ALGORITHM: VectorAlgorithms.HNSW,
// 				TYPE: 'FLOAT32',
// 				DIM: 1536,
// 				DISTANCE_METRIC: 'COSINE'
// 			}
// 		},
// 		{
// 			PREFIX: namespace
// 		}
// 	);
// } catch (e) {
// 	if (e.message === 'Index already exists') {
// 		console.log('Index already exists, skipped creation');
// 	} else {
// 		console.error(e);
// 		process.exit(1);
// 	}
// }
