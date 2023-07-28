import { embedding_model } from "$lib/constants";
import { openai } from "$lib/openai";
import { float32Buffer } from "./float32buffer";

export const v_blob = async (data: object) => {
	const v = await openai
		.createEmbedding({ model: embedding_model, input: JSON.stringify(data) })
		.then((r) => {
			return r.data.data[0].embedding;
		});h
	const blob = float32Buffer(v);
	return { v: blob, ...data };
};
