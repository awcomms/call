import { OPENAI } from "$env/static/private";
import { OpenAI } from "openai";

export const openai = new OpenAI({apiKey: OPENAI})