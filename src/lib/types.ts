export interface _Call {
    id: string,
    name: string,
    ids: string[]
}

export interface _Peer {
    stream: MediaStream,
    ref: any | undefined,
    peer: string
}