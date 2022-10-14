export interface Call {
    id: string,
    name: string,
    ids: string[]
}

export interface Peer {
    stream: MediaStream,
    ref: any | undefined,
    peer: string
}