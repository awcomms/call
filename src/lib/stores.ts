
import type { CarbonTheme } from 'carbon-components-svelte/types/Theme/Theme.svelte';
import { booleanStore, typeStore, stringStore, arrayStore } from './util/store';
import { writable } from 'svelte/store';
import type Peer from 'peerjs';

export const theme_key = '__carbon-theme';
export const theme = typeStore<CarbonTheme>(theme_key, 'g100');

export const loginOpen = booleanStore('loginOpen');

export const previousPage = stringStore('previousPage', '/');
export const newUser = booleanStore('newUser');
export const users = arrayStore('users', []);
export const searchTags = arrayStore('searchTags', []);
export const userTags = arrayStore('userTags', []);
export const isSideNavOpen = booleanStore('isSideNavOpen');
export const token = stringStore('token');

export const peer = writable<Peer>(undefined);


