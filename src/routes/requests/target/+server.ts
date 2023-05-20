import { error, text, type RequestHandler } from '@sveltejs/kit';
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

	const { id, target } = await request.json();

	await requests
		.updateOne({ id }, { $set: { target } }, { upsert: true })
		.catch((e) => {
			throw error(500, e);
        });
    if (await requests.findOne({ id: target, target: id })) {
		return text('1')
    } else {
        return text('0')
    }
}) satisfies RequestHandler;
