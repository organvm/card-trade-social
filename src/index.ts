/**
 * card-trade-social — Hydra TCG Platform
 * Part of the organvm eight-organ system (ORGAN-III: Commerce).
 */

import { z } from "zod";
import { logger } from "./logger";

export const VERSION = "0.1.0";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.string().default("info"),
});

export function main(args: string[] = []): void {
  try {
    // Validate environment
    const env = EnvSchema.parse(process.env);
    logger.debug({ env }, "Environment validated");

    logger.info(`Starting card-trade-social v${VERSION}`);
    
    if (args.includes("--help") || args.includes("-h")) {
      logger.info("Usage: card-trade-social [options]");
      logger.info("Commands:");
      logger.info("  issue-key <username>   Generate a new API key for the user");
      logger.info("  verify-key <api-key>   Verify an API key");
      logger.info("");
      logger.info("The authentication secrets are stored in ~/.card-trade-social/auth.json");
      return;
    }

    if (args[0] === "issue-key") {
      const username = args[1];
      if (!username) {
        logger.error("Username is required: card-trade-social issue-key <username>");
        process.exitCode = 1;
        return;
      }
      const { generateApiKey } = require("./auth");
      const key = generateApiKey(username);
      logger.info({ username, key }, "API key generated successfully. Save this key, it won't be shown again.");
      return;
    }

    if (args[0] === "verify-key") {
      const key = args[1];
      if (!key) {
        logger.error("API key is required: card-trade-social verify-key <api-key>");
        process.exitCode = 1;
        return;
      }
      const { verifyApiKey } = require("./auth");
      const result = verifyApiKey(key);
      if (result.valid) {
        logger.info({ username: result.username }, "API key is valid");
      } else {
        logger.error("Invalid API key");
        process.exitCode = 1;
      }
      return;
    }

    // Main execution logic here
    logger.info("Initialization complete");
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error({ errors: (error as any).errors }, "Validation error during startup");
    } else {
      logger.error(error, "Unhandled exception in main execution");
    }
    process.exitCode = 1;
  }
}

export * from "./logger";
export * from "./card";
export * from "./portfolio";
export * from "./trade";
export * from "./pricing";
export * from "./auth";
