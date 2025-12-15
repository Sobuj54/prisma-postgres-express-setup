import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import app from "./app";
import { Server } from "http";
import { logError, logInfo } from "./shared/logger";
import { prisma } from "./lib/prisma";

const port = process.env.PORT || 5000;
let server: Server | undefined;
let shuttingDown = false;

const FORCE_EXIT_TIMEOUT = 10_000; // 10 seconds

const shutdown = async (reason: string, exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  logInfo(`Shutdown initiated: ${reason}`);

  // Force exit if graceful shutdown hangs
  const forceExit = setTimeout(() => {
    logError("Forced shutdown after timeout");
    process.exit(1);
  }, FORCE_EXIT_TIMEOUT);

  try {
    if (server) {
      await new Promise<void>((resolve) => {
        server!.close((err) => {
          if (err) {
            logError("Error closing HTTP server", err);
          } else {
            logInfo("HTTP server closed");
          }
          resolve();
        });
      });
    }

    await prisma.$disconnect();
    logInfo("Prisma disconnected");

    clearTimeout(forceExit);
    logInfo("Shutdown completed");
    process.exit(exitCode);
  } catch (err) {
    logError("Shutdown failed", err as Error);
    process.exit(1);
  }
};

/* ===== Process-level handlers ===== */

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
  logError("Uncaught Exception", err);
  shutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (reason) => {
  logError("Unhandled Promise Rejection", reason as Error);
  shutdown("unhandledRejection", 1);
});

/* ===== App startup ===== */

const start = async () => {
  try {
    server = app.listen(port, () => {
      logInfo(`Server running on port ${port}`);
    });
  } catch (err) {
    logError("Failed to start server", err as Error);
    process.exit(1);
  }
};

start();
