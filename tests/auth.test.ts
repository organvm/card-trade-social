import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { generateApiKey, verifyApiKey, CONFIG_DIR, AUTH_FILE } from "../src/auth";

describe("auth", () => {
  const backupFile = AUTH_FILE + ".bak";

  beforeAll(() => {
    if (fs.existsSync(AUTH_FILE)) {
      fs.copyFileSync(AUTH_FILE, backupFile);
    }
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(backupFile)) {
      fs.renameSync(backupFile, AUTH_FILE);
    } else if (fs.existsSync(AUTH_FILE)) {
      fs.unlinkSync(AUTH_FILE);
    }
  });

  beforeEach(() => {
    if (fs.existsSync(AUTH_FILE)) {
      fs.unlinkSync(AUTH_FILE);
    }
  });

  test("generate and verify API key", () => {
    const key = generateApiKey("testuser");
    expect(key).toBeDefined();
    expect(key.startsWith("cts_")).toBe(true);

    const result = verifyApiKey(key);
    expect(result.valid).toBe(true);
    expect(result.username).toBe("testuser");
  });

  test("verify invalid API key", () => {
    const result = verifyApiKey("invalid_key");
    expect(result.valid).toBe(false);
    expect(result.username).toBeUndefined();
  });

  test("verify empty API key", () => {
    const result = verifyApiKey("");
    expect(result.valid).toBe(false);
  });
});
