import { MongoClient } from 'mongodb';

const uri =
	'mongodb+srv://gold67379:<lBHkrD8ZU6M4Yrx7>@call.arg4uux.mongodb.net/?retryWrites=true&w=majority';

export const client = new MongoClient(uri);