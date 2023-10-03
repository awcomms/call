export type Gender = '1' | '2' | '0' | undefined;
export interface Call {
	id: string;
	name: string;
	ids: string[];
	saved: boolean;
}

export type V = number[];

export interface User {
	embedding: V;
}

export interface _Remote {
	stream: MediaStream;
	peer: string;
}

export interface Message {
	s: string;
	r?: string;
	t: string;
}
