import { stringStore } from 'sveltekit-carbon-utils';
import { writable } from 'svelte/store';
import type Peer from 'peerjs';

export const peer = writable<Peer>(undefined);
export const description = stringStore('description', '');
export const offline = writable(false);

// export const description_embedding = derived<Writable<string>, number[]>(
// 	description,
//     ($description, set) => {
//             const arg = $description
// 			 axios.post('/embedding', arg).then((r) => {
// 				console.log('little cute embedding', r.data);
// 				set(r.data);
// 			});
// 	},
// 	empty_string_embedding
// );
