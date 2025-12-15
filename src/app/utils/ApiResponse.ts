// utils/ApiResponse.ts

export default class ApiResponse {
  statusCode: number;
  success: boolean;
  data: unknown;
  message: string;
  errors?: unknown;
  stack?: string;

  constructor(
    statusCode: number,
    data: unknown = null,
    message: string = '',
    errors: unknown = [],
    stack: string = ''
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    if (!this.success) this.errors = errors;
    if (stack) this.stack = stack;
  }
}
