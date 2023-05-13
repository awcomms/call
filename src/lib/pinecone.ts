import { PINECONE_ENVIRONMENT, PINECONE_KEY } from '$env/static/private';
import { PineconeClient } from '@pinecone-database/pinecone';

export const pinecone = new PineconeClient();

await pinecone.init({
	environment: PINECONE_ENVIRONMENT,
	apiKey: PINECONE_KEY
});

export const index = pinecone.Index('entries');
