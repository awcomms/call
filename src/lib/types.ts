export interface _Call {
    id: string,
    name: string,
    ids: string[]
}

export interface _Remote {
    stream: MediaStream,
    peer: string
}