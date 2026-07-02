import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { randomBytes, createHash } from "crypto";
import { logger } from "./logger";

export const CONFIG_DIR = path.join(os.homedir(), ".card-trade-social");
export const AUTH_FILE = path.join(CONFIG_DIR, "auth.json");

export interface AuthStore {
  keys: Record<string, string>; // hash -> username
}

export function getAuthStore(): AuthStore {
  if (!fs.existsSync(AUTH_FILE)) {
    return { keys: {} };
  }
  try {
    const data = fs.readFileSync(AUTH_FILE, "utf-8");
    return JSON.parse(data) as AuthStore;
  } catch (error) {
    logger.error(error, "Failed to read auth store");
    return { keys: {} };
  }
}

export function saveAuthStore(store: AuthStore): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(AUTH_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    logger.error(error, "Failed to save auth store");
    throw error;
  }
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Generates and stores a new API key for a given username.
 * @param username The username to associate with the key
 * @returns The raw API key (must be displayed to user once)
 */
export function generateApiKey(username: string): string {
  if (!username) {
    throw new Error("Username is required to generate an API key");
  }
  const rawKey = `cts_${randomBytes(16).toString("hex")}`;
  const store = getAuthStore();
  store.keys[hashKey(rawKey)] = username;
  saveAuthStore(store);
  return rawKey;
}

/**
 * Verifies an API key and returns the associated username.
 * @param key The raw API key to verify
 * @returns Object with valid status and optional username
 */
export function verifyApiKey(key: string): { valid: boolean; username?: string } {
  if (!key) {
    return { valid: false };
  }
  const store = getAuthStore();
  const username = store.keys[hashKey(key)];
  if (username) {
    return { valid: true, username };
  }
  return { valid: false };
}
