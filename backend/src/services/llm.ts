import OpenAI from "openai";
import type { Message } from "../types/types";
import { ChatCompletionMessageParam } from "openai/resources";
import { SYSTEM_PROMPT } from "#prompts/system-prompts";
import { cacheService } from "./cache";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const TOKEN_SIZE = Number.parseInt(process.env.MAX_TOKEN || "300"); // i am using smaller model that why token size is smaller

const CONFIG = {
    MODEL: "gpt-4o-mini",
    MAX_HISTORY: 10,
    MAX_TOKEN: TOKEN_SIZE,
    RETRIES: 2,
};

export const llmService = {
    generateReply: async (
        history: Message[],
        newMessage: string,
    ): Promise<string> => {
        try {
            const cacheReply = await cacheService.get(newMessage);
            if (cacheReply) {
                return cacheReply;
            }
            const recentHistory = history.slice(-CONFIG.MAX_HISTORY);

            const messages: ChatCompletionMessageParam[] = [
                { role: "system", content: SYSTEM_PROMPT },
                ...recentHistory.map((m) => ({
                    role: m.role as "user" | "assistant",
                    content: m.content || "",
                })),
                { role: "user", content: newMessage },
            ];

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: messages,
                max_completion_tokens: TOKEN_SIZE,
            });

            const response =
                completion.choices[0]?.message?.content ??
                "I apologize, I couldn't generate a response.";

            cacheService.set(newMessage, response);
            return response;
        } catch (error) {
            console.error(error);
            throw new Error("Service currently unavaiable");
        }
    },
};
