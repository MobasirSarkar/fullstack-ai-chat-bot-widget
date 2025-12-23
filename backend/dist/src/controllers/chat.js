import { conversationRepo } from "../db/repository.js";
import { llmService } from "../services/llm.js";
const MAX_MESSAGE_LENGTH = 1000;
export const ChatController = {
    handleMessage: async (body) => {
        const safeBody = body;
        let { sessionId, message } = safeBody;
        if (!message ||
            typeof message !== "string" ||
            message.trim().length === 0) {
            throw new Error("Message cannot be empty");
        }
        if (message.length > MAX_MESSAGE_LENGTH) {
            message =
                message.substring(0, MAX_MESSAGE_LENGTH) + "... (truncated)";
        }
        if (sessionId &&
            (typeof sessionId !== "string" ||
                sessionId.length > MAX_MESSAGE_LENGTH)) {
            sessionId = undefined;
        }
        if (!sessionId || conversationRepo.exists(sessionId)) {
            sessionId = conversationRepo.createSession();
        }
        try {
            const history = conversationRepo.getHistory(sessionId);
            // Even if LLM fails, we want to capture the User's message in DB
            conversationRepo.addMessage(sessionId, "user", message);
            const reply = await llmService.generateReply(history, message);
            conversationRepo.addMessage(sessionId, "assistant", reply);
            return { reply, sessionId };
        }
        catch (error) {
            // 6. LOGGING: Log the real error internally
            console.error(`Controller Error [Session: ${sessionId}]:`, error);
            // Re-throw a clean error for the Express middleware to catch
            throw new Error("Failed to process message");
        }
    },
    getHistory: (sessionId) => {
        if (!conversationRepo.exists(sessionId)) {
            throw new Error("Session not found");
        }
        return conversationRepo.getHistory(sessionId);
    },
};
