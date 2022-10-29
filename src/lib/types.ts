export interface _Call {
    id: string,
    name: string,
    ids: string[],
    saved: boolean,
}

export interface _Remote {
    stream: MediaStream,
    peer: string
}