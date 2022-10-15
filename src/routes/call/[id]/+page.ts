import { req } from "$lib/req";

export const load = async ({params}) => {
    let {id} = params;
    let call = await req({Call: {Get: {id: Number(id)}}})
    if (call.error) {
        // 
    }
    return { call }
}