import { remote } from "../embedding/remote";

export const embed_user = (arg: { name?: string; text?: string }): Promise<number[]> =>
	remote(JSON.stringify(arg)) as Promise<number[]>;
