import type { CarbonTheme } from 'carbon-components-svelte/types/Theme/Theme.svelte';
import { booleanStore, typeStore, stringStore, arrayStore } from './util/store';
import { derived, writable , type Writable } from 'svelte/store';
import axios from 'axios';
import {empty_string_embedding} from '$lib//constants';
import type Peer from 'peerjs';

export const loginOpen = booleanStore('loginOpen');

export const previousPage = stringStore('previousPage', '/');
export const newUser = booleanStore('newUser');
export const users = arrayStore('users', []);
export const searchTags = arrayStore('searchTags', []);
export const userTags = arrayStore('userTags', []);
export const isSideNavOpen = booleanStore('isSideNavOpen');
export const token = stringStore('token');

export const peer = writable<Peer>(undefined);
export const description = stringStore('description', '');

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
