import { MulterError } from "multer";
import { Prisma } from "../../generated/prisma/client";
import { IGenericError, IGenericValidationError } from "../interfaces/error";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";

export const handlePrismaError = (err: unknown): IGenericError => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return {
          statusCode: 409,
          message: "Duplicate field value",
          error: [
            {
              path: (err.meta?.target as string[])?.join(", ") || "",
              message: "Already exists",
            },
          ],
        };

      case "P2025":
        return {
          statusCode: 404,
          message: "Record not found",
          error: [
            {
              path: "",
              message: err.meta?.cause as string,
            },
          ],
        };

      case "P2003":
        return {
          statusCode: 400,
          message: "Foreign key constraint failed",
          error: [
            {
              path: "",
              message: "Invalid reference",
            },
          ],
        };

      case "P2000":
        return {
          statusCode: 400,
          message: "Value too long for column",
          error: [
            {
              path: "",
              message: "Input value is too long",
            },
          ],
        };

      default:
        return {
          statusCode: 400,
          message: "Database error",
          error: [
            {
              path: "",
              message: err.message,
            },
          ],
        };
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: 400,
      message: "Invalid database query",
      error: [
        {
          path: "",
          message: err.message,
        },
      ],
    };
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return {
      statusCode: 503,
      message: "Database unavailable",
      error: [
        {
          path: "",
          message: "Failed to connect to database",
        },
      ],
    };
  }

  return {
    statusCode: 500,
    message: "Internal server error",
    error: [
      {
        path: "",
        message: "Unknown Prisma error",
      },
    ],
  };
};

const handleMulterError = (err: MulterError): IGenericError => {
  let message = err.message;
  if (err.code === "LIMIT_FILE_SIZE") {
    message = "File too large. Max size is 5MB.";
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    message = "Unexpected file field.";
  }

  const errors: IGenericValidationError[] = [
    {
      path: err.field || "",
      message: message,
    },
  ];

  return {
    statusCode: 400,
    message: message,
    error: errors,
    stack: err.stack,
  };
};

const handleJWTError = (
  err: TokenExpiredError | JsonWebTokenError
): IGenericError => {
  let message = err.message;
  if (err instanceof TokenExpiredError) {
    message = "Token expired. Please log in again.";
  } else if (err instanceof JsonWebTokenError) {
    message = "Invalid token. Authentication failed.";
  }

  const errors: IGenericValidationError[] = [{ path: "", message: message }];

  return {
    statusCode: 401,
    message: message,
    error: errors,
    stack: err.stack,
  };
};

const zodValidationError = (err: ZodError): IGenericError => {
  const errors: IGenericValidationError[] = err.issues.map((i) => ({
    path: i.path[i.path.length - 1] || "",
    message: i.message,
  }));
  return {
    statusCode: 400,
    message: "Validation Error",
    error: errors,
    stack: err.stack,
  };
};

export { zodValidationError, handleMulterError, handleJWTError };

/*
err.issuses look like below:
[
  {
    expected: 'string',
    code: 'invalid_type',
    path: [ 'user', 'role' ],
    message: 'Invalid input: expected string, received undefined'
  },
  {
    code: 'unrecognized_keys',
    keys: [ 'rolex' ],
    path: [ 'user' ],
    message: 'Unrecognized key: "rolex"'
  }
]
*/
