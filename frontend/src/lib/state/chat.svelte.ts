import { sendMessage } from "$lib/api";

export interface Message {
    role: "user" | "assistant";
    content: string;
}

class ChatState {
    messages = $state<Message[]>([]);
    sessionId = $state<string | undefined>(undefined);
    isLoading = $state(false);
    error = $state<string | null>(null);

    async send(text: string) {
        if (!text.trim()) return;

        this.messages.push({ role: "user", content: text });
        this.isLoading = true;
        this.error = null;

        try {
            const data = await sendMessage(text, this.sessionId);
            this.sessionId = data.sessionId;
            this.messages.push({
                role: "assistant",
                content: data.reply,
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";

            this.messages.push({
                role: "assistant",
                content: "Message failed to send.",
            });
            this.error = errorMessage;
        } finally {
            this.isLoading = false;
        }
    }
}

export const chatState = new ChatState();
