import { Server } from 'socket.io';
import type { Server as _Server } from 'http';
// import { index } from './pinecone';
// import { namespace } from './constants';
// import { PINECONE_ENVIRONMENT, PINECONE_KEY } from '$env/static/private';
import { PineconeClient } from '@pinecone-database/pinecone';

const pinecone = new PineconeClient();

const PINECONE_ENVIRONMENT = 'us-east1-gcp';
const PINECONE_KEY = '81160c0d-8aef-4c52-b180-2c3123136b1f';

await pinecone.init({
	environment: PINECONE_ENVIRONMENT,
	apiKey: PINECONE_KEY
});

const index = pinecone.Index('entries');

/**
 * array of requests: {peer_id, socket_id, target}
 * when client gets a peer id, send an event 'peer_id'
 * if existing socket_id or peer_id, delete entry and add new one
 *
 * when someone sends a call event, check if the target exists in requests and is connected
 *  if so
 * 	 add the target to the request
 *   requests.find(target = peer_id)
 *    if so:
 *      respond with a 'call' event
 *   if not:
 *     do nothing
 *  if not
 * 		if not connected
 * 			respond with 'offline'
 * 		else
 * 			respond with 'not_connected'
 *
 * when client receives call event with data: peer_id
 * 	if client target is peer_id, call peer_id
 *
 * when client receives call
 * 	if client target is peer_id
 * 		accept
 * 	else:
 * 		close
 *
 * when server detects client diconnnect
 * 	remove client request from requests
 */

type SocketId = string;
type PeerId = string;

interface Request {
	socket_id: SocketId;
	peer_id: PeerId;
	target?: PeerId;
}

const requests: Request[] = [];

export const getIO = (server: _Server) => {
	const io = new Server(server);

	io.on('connection', (socket) => {
		socket.on('peer_id', (peer_id: PeerId, ack) => {
			// remove caller from requests if it already exists
			const index = requests.findIndex((r) => (r.peer_id === peer_id )|| (r.socket_id === socket.id));
			if (index) {
				console.log('found from before', requests[index])
				// requests.splice(index, 1);
			}
			requests.push({ peer_id, socket_id: socket.id });
			console.log('added', peer_id);
			console.log('requests', requests);
			ack();
		});
		socket.on('call', (target_id: PeerId, ack) => {
			console.log('requests', requests)
			console.log(socket.id, 'wants to call', target_id);
			const target = requests.find((r) => r.peer_id === target_id);
			if (!target) {
				console.log(`target ${target_id} not found as peer_id in requests`)
				ack(0);
				return;
			}
			// const target_socket = io.sockets.sockets.get(target.socket_id);
			// if (!target_socket || target_socket.connected) {
			// 	ack(0);
			// 	return;
			// }
			const caller = requests.find((r) => r.socket_id === socket.id);
			if (!caller) {
				console.log(`caller ${socket.id} not found`)
				// ack(0);
				// return;
			}
			console.log('requests before setting target', requests);
			caller.target = target_id;
			console.log('requests after setting target, before checking can call', requests);
			if (target && target.target === caller.peer_id) {
				console.log('can call', target_id);
				ack(1);
			}
		});

		socket.on('disconnect', async () => {
			requests.splice(
				requests.findIndex((r) => r.socket_id === socket.id),
				1
			);
			const request = requests.find((r) => r.socket_id === socket.id);

			if (!request) return;

			await index.delete1({ ids: [request.peer_id], namespace: 'call' });
			console.log('deleted', request.peer_id)
		});
	});

	return io;
};
