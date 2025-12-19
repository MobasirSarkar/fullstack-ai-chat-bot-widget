import { redis } from "../lib/redis";
import crypto from "node:crypto";

const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export const cacheService = {
    generateKey: (text: string): string => {
        const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, "");

        const hash = crypto
            .createHash("sha256")
            .update(normalized)
            .digest("hex");
        return `faq_cache:${hash}`;
    },

    get: async (text: string): Promise<string | null> => {
        try {
            const key = cacheService.generateKey(text);
            return await redis.get(key);
        } catch (error) {
            console.error("Cache Read Error", error);
            return null;
        }
    },

    set: async (text: string, reply: string): Promise<void> => {
        try {
            const key = cacheService.generateKey(text);

            redis.set(key, reply, "EX", CACHE_TTL_SECONDS);
        } catch (error) {
            console.warn("Cache Write Error: ", error);
        }
    },
};
