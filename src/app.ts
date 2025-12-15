import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Application = express();

const allowedOrigin = process.env.CLIENT_URL;

app.use(
  cors({
    origin: allowedOrigin, // must match frontend origin
    credentials: true, // allow cookies/auth headers
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import allRoutes from "./app/routes/index";
app.use("/api/v1", allRoutes);

app.get("/health", (_, res) => res.json({ ok: true }));
app.get("/", (_, res) => res.json({ status: "Server is running" }));

// ------------------- Not Found Handler -------------------
// Forward 404 to error handler for consistency
import ApiError from "./app/utils/ApiError";
app.use((req: Request, res: Response, next: NextFunction) => {
  next(
    new ApiError(404, "Route not found.", [
      {
        path: req.originalUrl,
        message: "Route not found.",
      },
    ])
  );
});

// ------------------- Centralized Error Handler -------------------
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
app.use(globalErrorHandler);

export default app;
