import { ChatController } from "../controllers/chat.js";
export async function MessageHandler(req, res) {
    try {
        const result = await ChatController.handleMessage(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        const statusCode = errorMessage === "Message cannot be empty" ? 400 : 500;
        res.status(statusCode).json({
            error: errorMessage,
        });
    }
}
