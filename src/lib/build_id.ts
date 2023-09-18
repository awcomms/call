import { PREFIX } from "./constants";

export const build_id = (id: string | number) => PREFIX.concat(id.toString())