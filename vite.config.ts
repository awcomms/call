import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
// import { web_socket_server } from './web_socket_server_vite_plugin';

const config: UserConfig = {
	plugins: [sveltekit(), /*web_socket_server*/]
};

export default config;
