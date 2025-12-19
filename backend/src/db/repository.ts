import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import type { Message, Role } from "../types/types.ts";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "chat.db");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
        recursive: true,
    });
}
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT,
    role TEXT,
    content TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(conversation_id) REFERENCES conversations(id)
  );
`);

export const conversationRepo = {
    createSession: (): string => {
        const id = randomUUID();
        const stmt = db.prepare("INSERT INTO conversations (id) VALUES (?)");
        stmt.run(id);
        return id;
    },

    exists: (id: string): boolean => {
        const stmt = db.prepare("SELECT 1 FROM conversations WHERE id = ?");
        return !!stmt.get(id);
    },

    addMessage: (conversationId: string, role: Role, content: string): void => {
        const stmt = db.prepare(
            `INSERT INTO messages (conversation_id, role, content) VALUES (?,?,?)`,
        );
        stmt.run(conversationId, role, content);
    },

    getHistory: (conversationId: string): Message[] => {
        const stmt = db.prepare(
            `SELECT id, conversation_id as conversationId, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`,
        );
        return stmt.all(conversationId) as Message[];
    },
};
