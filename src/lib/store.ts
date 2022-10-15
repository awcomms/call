import { browser } from "$app/environment";
import { req } from "$lib/req";
import { writable, derived } from 'svelte/store';

export const booleanStore = (key = '', initialValue = false) => {
	let previousValue: boolean
	if (browser) {
		const fromLocalStorage = localStorage.getItem(key);
		if (fromLocalStorage) {
			previousValue = JSON.parse(fromLocalStorage);
		} else {
			previousValue = initialValue;
		}
	} else {
		previousValue = initialValue
	}
	const s = writable<boolean>(previousValue);
	if (browser) s.subscribe((v) => localStorage.setItem(key, String(v)));
	return s;
};

export const numberStore = (key = '', initialValue = 0) => {
	let previousValue: number
	if (browser) {
		const fromLocalStorage = localStorage.getItem(key);
		if (fromLocalStorage) {
			previousValue = JSON.parse(fromLocalStorage);
		} else {
			previousValue = initialValue;
		}
	} else {
		previousValue = initialValue
	}
	const s = writable<number>(previousValue);
	if (browser) s.subscribe((v) => localStorage.setItem(key, String(v)));
	return s;
};

export const stringStore = (key = '', initialValue = '') => {
	let previousValue: string;
	if (browser) {
		previousValue = localStorage.getItem(key) || initialValue
	} else {
		previousValue = initialValue;
	}
	const s = writable<string>(previousValue);
	if (browser) s.subscribe((v) => localStorage.setItem(key, v));
	return s;
};

export const arrayStore = (key = '', initialValue: Array<any>) => {
	let previousValue: Array<any>;
	if (browser) {
		const fromLocalStorage = localStorage.getItem(key);
		if (fromLocalStorage) {
			previousValue = JSON.parse(fromLocalStorage)
		} else {
			previousValue = initialValue
		}
	} else {
		previousValue = initialValue;
	}
	const s = writable<Array<any>>(previousValue);
	if (browser) s.subscribe((v) => localStorage.setItem(key, JSON.stringify(v)));
	return s;
};

export const objectStore = (key = '', initialValue: object) => {
	let previousValue: object;
	if (browser) {
		const fromLocalStorage = localStorage.getItem(key);
		if (fromLocalStorage) {
			previousValue = JSON.parse(fromLocalStorage);
		} else {
			previousValue = initialValue;
		}
	} else {
		previousValue = initialValue;
	}
	const s = writable<object>(previousValue);
	if (browser) s.subscribe((v) => localStorage.setItem(key, JSON.stringify(v)));
	return s;
};

export const loginOpen = booleanStore("loginOpen");

export const previousPage = stringStore("previousPage", "/");
export const newUser = booleanStore("newUser");
export const users = arrayStore("users", []);
export const userTags = arrayStore("userTags", []);
export const isSideNavOpen = booleanStore("isSideNavOpen");
export const token = stringStore("token");

export const user = derived(token, ($token, set) => {
	req({User: {Auth: $token}}).then((r) => {
		set(r)
	});
});