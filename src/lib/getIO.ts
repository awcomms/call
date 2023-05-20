import { Server } from 'socket.io';
import type { Server as _Server } from 'http';
import { PineconeClient } from '@pinecone-database/pinecone';

const pinecone = new PineconeClient();

const PINECONE_ENVIRONMENT = 'us-east1-gcp';
const PINECONE_KEY = '81160c0d-8aef-4c52-b180-2c3123136b1f';

await pinecone.init({
	environment: PINECONE_ENVIRONMENT,
	apiKey: PINECONE_KEY
});

const index = pinecone.Index('entries');

const delete_id_from_pinecone = (id: PeerId) =>
	index.delete1({ ids: [id], namespace: 'call' }).then((r) => {
		console.log('deleted from pinecone', id);
		return r;
	});

type SocketId = string;
type PeerId = string;

const ids: Record<SocketId, PeerId> = {};
const targets: Record<PeerId, PeerId> = {};

export const getIO = (server: _Server) => {
	const io = new Server(server);

	io.on('connection', (socket) => {
		socket.on('peer_id', (peer_id: PeerId, ack) => {
			ids[socket.id] = peer_id;
			console.log('added', peer_id);
			console.log('ids', ids);
			ack();
		});
		socket.on('call', async (target_id: PeerId, ack) => {
			console.log('targets', targets);
			targets[ids[socket.id]] = target_id;
			if (!Object.values(ids).find((id) => id === target_id)) {
				await delete_id_from_pinecone(target_id);
				return ack(0)
			}
			if (targets[target_id] === ids[socket.id]) {
				console.log('can call', target_id);
				return ack(1);
			} else {
				return ack(0);
			}
		});

		socket.on('disconnect', async () => {
			delete targets[ids[socket.id]];
			await delete_id_from_pinecone(ids[socket.id]);
			delete ids[socket.id];
			console.log('deleted on disconect', socket.id);
		});
	});

	return io;
};
