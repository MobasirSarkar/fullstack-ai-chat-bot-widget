import { sendMessage } from "$lib/api";
import { writable, get } from "svelte/store";

export interface Message {
    role: "user" | "assistant";
    content: string;
}

function createChatStore() {
    const { subscribe, update } = writable<{
        messages: Message[];
        sessionId: string | undefined;
        isLoading: boolean;
        error: string | null;
    }>({
        messages: [],
        sessionId: undefined,
        isLoading: false,
        error: null,
    });

    return {
        subscribe,
        send: async (text: string) => {
            update((s) => {
                if (!text.trim()) return s;
                return {
                    ...s,
                    messages: [
                        ...s.messages,
                        {
                            role: "user",
                            content: text,
                        },
                    ],
                    isLoading: true,
                    error: null,
                };
            });

            const currentState = get({ subscribe });
            try {
                const data = await sendMessage(text, currentState.sessionId);

                update((s) => ({
                    ...s,
                    sessionId: data.sessionId,
                    messages: [
                        ...s.messages,
                        { role: "assistant", content: data.reply },
                    ],
                    isLoading: false,
                }));
            } catch (error) {
                const erroMessage =
                    error instanceof Error ? error.message : "Unknown error";
                update((s) => ({
                    ...s,
                    isLoading: false,
                    messages: [
                        ...s.messages,
                        {
                            role: "assistant",
                            content: `Error: ${erroMessage}`,
                        },
                    ],
                }));
            }
        },
    };
}

export const chatStore = createChatStore();
