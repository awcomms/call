import { build_id } from "$lib/build_id";
import { handle_server_error } from "$lib/handle_server_error";
import { client } from "$lib/redis";
import { text } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => client.exists(build_id(params.id)).then(r => r ? text(".") : text("")).catch(e => {throw handle_server_error(`/users/${params.id}/exists error:`, e)})