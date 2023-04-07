import { OPENAI } from "$env/static/private";
import { Configuration, OpenAIApi } from "openai";

export const configuration = new Configuration({apiKey: OPENAI})

export const openai = new OpenAIApi(configuration)