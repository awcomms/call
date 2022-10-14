import { req } from "$lib/util/req";

export const load = async ({params}) => {
    let {id} = params;
    let call = await req({Call: {Get: {id}}})
    if (call.error) {
        // 
    }
    return { call }
}