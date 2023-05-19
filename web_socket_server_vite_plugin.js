import { getIO } from './src/lib/getIO.js';

export const web_socket_server = {
    name: 'web_socket_server',
    configureServer(server) {
        getIO(server.httpServer)
    }
}