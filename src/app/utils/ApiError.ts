class ApiError extends Error {
  public readonly statusCode: number;
  public readonly success: boolean;
  public readonly error: unknown;

  constructor(
    statusCode: number,
    message = 'Something went wrong',
    error: unknown = [],
    stack: string = ''
  ) {
    super(message);
    // 👇 Ensures the correct prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;

    this.statusCode = statusCode;
    this.success = false;
    this.error = error;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
