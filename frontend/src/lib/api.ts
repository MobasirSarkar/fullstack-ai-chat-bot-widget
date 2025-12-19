import { z } from "zod";
import { PUBLIC_API_URL } from "$env/static/public";
export const ChatResponseSchema = z.object({
    reply: z.string(),
    sessionId: z.string(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export const sendMessage = async (
    message: string,
    sessionId?: string,
): Promise<ChatResponse> => {
    const res = await fetch(PUBLIC_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
    });

    let data;
    try {
        data = await res.json();
    } catch (err) {
        throw new Error("Failed to parse server response");
    }

    if (!res.ok || data.error) {
        throw new Error(data.error || `Error ${res.status}: Request failed`);
    }

    const result = ChatResponseSchema.safeParse(data);

    if (!result.success) {
        console.error("Validation Failed:", result.error);
        throw new Error("Received invalid data from server"); // Generic friendly message
    }

    return result.data;
};
