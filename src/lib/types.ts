export interface Call {
    id: string,
    name: string,
    ids: string[],
    saved: boolean,
}

export type Id = string;

export interface _Remote {
    stream: MediaStream,
    peer: string
}