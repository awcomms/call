import { error, type RequestHandler } from '@sveltejs/kit';
import { client } from '$lib/mongodb';

// async function run() {
// 	try {
// 		const database = client.db('sample_mflix');
// 		const movies = database.collection('movies');

// 		// Query for a movie that has the title 'Back to the Future'
// 		const query = { title: 'Back to the Future' };
// 		const movie = await movies.findOne(query);

// 		console.log(movie);
// 	} finally {
// 		// Ensures that the client will close when you finish/error
// 		await client.close();
// 	}
// }
// run().catch(console.dir);

export const POST = (async ({ request }) => {
	const db = client.db('call');
	const requests = db.collection('requests');

	return requests
		.insertOne({ peer_id: await request.text() })
		.then(() => new Response(null, { status: 200 }))
		.catch((e) => {
			throw error(500, e);
		});
}) satisfies RequestHandler;
