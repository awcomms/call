import { v4 as uuidv4 } from 'uuid';
import { get } from 'svelte/store'
import { token } from '$lib/store'
import { BACKEND } from '$lib/env';
import iso_ws from 'isomorphic-ws';

const reqs = new Map();

interface Res {
	id: string;
	data: string;
}

const socket = new iso_ws(BACKEND);

// TODO error notification if response error

const getWS = () => {
	return new Promise((resolve) => {
		setInterval(() => {
			if (socket.readyState === 1) resolve(socket);
		}, 11);
	});
};

socket.onmessage = ({ data }: { data: string }) => {
	try {
		const res: Res = JSON.parse(data);
		const resolve = reqs.get(res.id);
		if (!resolve) {
			console.error(`response with unmatched id: ${JSON.stringify(res)}`);
		} else {
			try {
				const json_res = JSON.parse(res.data)
				resolve(json_res)
			} catch {
				resolve(res.data)
			}
		}
	} catch {
		console.error(`non-JSON response: ${data}`);
	}
};

socket.onerror = (e) => {
	console.log('socket error', e)
}

export const req = async (data: any, auth = false) => {
	const id = uuidv4();
	let model = data;
	if (typeof model !== "string") {
		if (auth) model[Object.keys(model)[0]].token = get(token);
	}
	return new Promise((resolve) => {
		reqs.set(id, resolve);
		getWS().then((socket) =>
			socket.send(JSON.stringify({ id, model }))
		);
	});
};
