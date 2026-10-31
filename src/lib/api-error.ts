import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Canonical error codes used across the whole API.
 * See docs/API_CONTRACT.md §2.
 */
export const ErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  PROFILE_NOT_VERIFIED: "PROFILE_NOT_VERIFIED",
  NOT_FOUND: "NOT_FOUND",
  COMMUNITY_NOT_FOUND: "COMMUNITY_NOT_FOUND",
  EVENT_NOT_FOUND: "EVENT_NOT_FOUND",
  CONFLICT: "CONFLICT",
  EVENT_FULL: "EVENT_FULL",
  REGISTRATION_CLOSED: "REGISTRATION_CLOSED",
  EVENT_ENDED: "EVENT_ENDED",
  LAST_ORGANIZER: "LAST_ORGANIZER",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * An error that carries an explicit HTTP status and error code.
 * Services throw these; route handlers map them to a response.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCodeValue;
  readonly details?: unknown;

  constructor(
    status: number,
    code: ErrorCodeValue,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Map a domain error message to its HTTP status and error code.
 *
 * The services throw plain `Error` instances with a stable message, so the
 * mapping is centralised here to guarantee one consistent format everywhere.
 */
export function resolveApiError(error: unknown): {
  status: number;
  code: ErrorCodeValue;
  message: string;
  details?: unknown;
} {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof z.ZodError) {
    return {
      status: 422,
      code: ErrorCode.VALIDATION_ERROR,
      message: "Invalid request data",
      details: error.issues,
    };
  }

  const message = error instanceof Error ? error.message : "Unexpected error";

  switch (message) {
    case "UNAUTHORIZED":
    case "Unauthorized":
      return {
        status: 401,
        code: ErrorCode.UNAUTHORIZED,
        message: "Authentication required",
      };
    case "FORBIDDEN":
    case "Forbidden":
      return {
        status: 403,
        code: ErrorCode.FORBIDDEN,
        message: "You do not have access to this resource",
      };
    case "PROFILE_NOT_VERIFIED":
    case "Profile not verified":
      return {
        status: 403,
        code: ErrorCode.PROFILE_NOT_VERIFIED,
        message: "Your profile must be verified before performing this action",
      };
    case "ADMIN_REQUIRED":
    case "Admin access required":
      return {
        status: 403,
        code: ErrorCode.FORBIDDEN,
        message: "Admin access required",
      };
    case "ORGANIZER_REQUIRED":
    case "Organizer access required":
      return {
        status: 403,
        code: ErrorCode.FORBIDDEN,
        message: "Organizer access required for this community",
      };
    case "NOT_FOUND":
      return {
        status: 404,
        code: ErrorCode.NOT_FOUND,
        message: "Resource not found",
      };
    case "COMMUNITY_NOT_FOUND":
    case "Community not found":
      return {
        status: 404,
        code: ErrorCode.COMMUNITY_NOT_FOUND,
        message: "Community not found",
      };
    case "EVENT_NOT_FOUND":
    case "Event not found":
      return {
        status: 404,
        code: ErrorCode.EVENT_NOT_FOUND,
        message: "Event not found",
      };
    case "EVENT_FULL":
    case "Event is full":
      return {
        status: 409,
        code: ErrorCode.EVENT_FULL,
        message: "Event is full",
      };
    case "REGISTRATION_CLOSED":
    case "Registration is closed for this event":
      return {
        status: 409,
        code: ErrorCode.REGISTRATION_CLOSED,
        message: "Registration is closed for this event",
      };
    case "EVENT_ENDED":
    case "Event already ended":
      return {
        status: 409,
        code: ErrorCode.EVENT_ENDED,
        message: "Event has already ended",
      };
    case "LAST_ORGANIZER":
    case "Last organizer cannot leave the community":
      return {
        status: 409,
        code: ErrorCode.LAST_ORGANIZER,
        message: "The last organizer cannot leave the community",
      };
    case "CONFLICT":
    case "Conflict":
      return {
        status: 409,
        code: ErrorCode.CONFLICT,
        message: "The request conflicts with the current state",
      };
    case "VALIDATION_ERROR":
      return {
        status: 422,
        code: ErrorCode.VALIDATION_ERROR,
        message: "Invalid request data",
      };
    default:
      return {
        status: 500,
        code: ErrorCode.INTERNAL_ERROR,
        message: "An unexpected error occurred",
      };
  }
}

/**
 * Build the canonical error response body.
 */
export function buildErrorBody(
  code: ErrorCodeValue,
  message: string,
  details?: unknown
) {
  return {
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  };
}

/**
 * Convert any thrown value into the canonical error response.
 */
export function errorResponse(error: unknown) {
  const { status, code, message, details } = resolveApiError(error);
  return NextResponse.json(buildErrorBody(code, message, details), { status });
}
