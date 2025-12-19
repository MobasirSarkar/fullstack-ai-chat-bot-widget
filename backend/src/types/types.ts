export type Role = "user" | "assistant" | "system";

export interface Message {
    id: number;
    conversationId: string;
    role: Role;
    content: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    createdAt: string;
}

export interface ChatRequest {
    message: string;
    sessionId?: string;
}

export interface ChatResponse {
    reply: string;
    sessionId: string;
}
