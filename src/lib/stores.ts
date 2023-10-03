import { booleanStore, stringStore, typeStore } from 'sveltekit-carbon-utils';
import { writable } from 'svelte/store';
import type Peer from 'peerjs';
import type { Gender } from './types';

const resolove_gender = (v: string): Gender => {
    if (v !== ("1" || "2" || "0" || undefined)) {
        return undefined
    }
    return v
}

export const peer = writable<Peer>(undefined);
export const description = stringStore('description', '');
export const offline = writable(false);
export const chat_open = booleanStore('chat_open')
export const id = stringStore('id', '')
export const gender = typeStore<Gender>('gender', undefined, resolove_gender)
export const search_gender = typeStore<Gender>('search_gender', undefined, resolove_gender)
export const use_description = booleanStore('use_description', true);
export const pay_email = stringStore('pay_email');

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
