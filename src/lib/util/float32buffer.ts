import type { V } from "$lib/types";

export const float32Buffer = (arr: V): Buffer => {
	return Buffer.from(new Float32Array(arr).buffer);
};