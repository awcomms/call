import type { ObjectId } from "mongodb";

export type Gender = "1" | "2" | "0";
export interface Call {
    id: string,
    name: string,
    ids: string[],
    saved: boolean,
}

export type V = number[]

export interface User {
    _id: ObjectId,
    peer_id: string,
    embedding: V
}

export type Id = string;

export interface _Remote {
    stream: MediaStream,
    peer: string
}