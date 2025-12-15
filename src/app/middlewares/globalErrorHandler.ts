/* eslint-disable no-unused-vars */
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { IGenericError } from "../interfaces/error";
import { Prisma } from "../../generated/prisma/client";
import { logError } from "../../shared/logger";
import {
  handleJWTError,
  handleMulterError,
  handlePrismaError,
  zodValidationError,
} from "../utils/errorHandlers";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { MulterError } from "multer";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let error: IGenericError;

  /** Custom application errors */
  if (err instanceof ApiError) {
    error = {
      statusCode: err.statusCode,
      message: err.message,
      error: [
        {
          path: "",
          message: err.message,
        },
      ],
      stack: err.stack,
    };
  } else if (err instanceof ZodError) {
    error = zodValidationError(err);
  } else if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientValidationError ||
    err instanceof Prisma.PrismaClientInitializationError
  ) {
    error = handlePrismaError(err);
  } else if (
    err instanceof TokenExpiredError ||
    err instanceof JsonWebTokenError
  ) {
    error = handleJWTError(err);
  } else if (err instanceof MulterError) {
    error = handleMulterError(err);
  } else {
    error = {
      statusCode: err?.statusCode || 500,
      message: err?.message || "Something went wrong",
      error: err?.error || [],
      stack: err?.stack,
    };
  }

  /** Logging */
  if (process.env.NODE_ENV !== "development") {
    logError(error.message, error.statusCode);
  }

  /** Response */
  res
    .status(error.statusCode)
    .json(
      new ApiResponse(
        error.statusCode,
        null,
        error.message,
        error.error,
        process.env.NODE_ENV === "development" ? error.stack : ""
      )
    );
};

export default globalErrorHandler;
