export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INSUFFICIENT_CREDITS"
  | "TRANSITION_NOT_ALLOWED"
  | "VALIDATION_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "DISTANCE_TIME_UNAVAILABLE"
  | "OUT_OF_COVERAGE"
  | "INTERNAL_SERVER_ERROR";

type AppErrorInput = {
  code: AppErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
};

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(input: AppErrorInput) {
    super(input.message);
    this.name = "AppError";
    this.code = input.code;
    this.statusCode = input.statusCode;
    this.details = input.details;
  }
}
