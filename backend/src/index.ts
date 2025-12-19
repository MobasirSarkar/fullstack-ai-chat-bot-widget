import express, { Request, Response } from "express";
import cors from "cors";
import { MessageHandler } from "./handlers/message";
import { configDotenv } from "dotenv";

configDotenv();

const app = express();
const PORT = Number.parseInt(process.env.PORT || "3000");

app.use(cors());
app.use(express.json());

app.post("/chat/message", MessageHandler);

app.use((_req: Request, res: Response) => {
    res.status(404).send("Not found");
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
