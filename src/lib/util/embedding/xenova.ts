import { pipeline } from "@xenova/transformers"

export const xenova = async (text: string): Promise<Float32Array> => {
    const extractor = await pipeline('feature-extraction', 'Xenova/bert-base-uncased', { revision: "default" });
    const output = await extractor(text, { pooling: "mean", normalize: true })
    return output.data
}