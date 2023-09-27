import { SchemaFieldTypes, VectorAlgorithms } from "redis";
import { client } from ".";
import { PREFIX, index } from '../constants';

export const setup = async() => {
try {
	await client.ft.create(
		index,
		{
			'$.v': {
				AS: 'v',
				type: SchemaFieldTypes.VECTOR,
				ALGORITHM: VectorAlgorithms.FLAT,
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
	);
} catch (e) {
	console.error(`redis client.ft.create(${index})`);
}}