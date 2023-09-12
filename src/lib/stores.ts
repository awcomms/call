import { booleanStore, numberStore, stringStore, typeStore } from 'sveltekit-carbon-utils';
import { writable } from 'svelte/store';
import type Peer from 'peerjs';
import type { Gender } from './types';

export const peer = writable<Peer>(undefined);
export const description = stringStore('description', '');
export const offline = writable(false);
export const gender = typeStore<Gender>('gender', "0", (v) =>v as Gender)
export const search_gender = typeStore<Gender>('search_gender', "0", (v) =>v as Gender)
export const use_description = booleanStore('use_description', false);

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
