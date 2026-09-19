import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(
    message: string,
    status = 400,
    details?: unknown,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function handleApiError(error: unknown) {
  // Zod validation error
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: error.flatten(),
      },
      {
        status: 422,
      },
    );
  }

  // Our own application error
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        ...(error.details !== undefined && {
          details: error.details,
        }),
      },
      {
        status: error.status,
      },
    );
  }

  // Unexpected error
  console.error("[API_ERROR]", error);

  return NextResponse.json(
    {
      success: false,
      error: "Something went wrong. Please try again.",
    },
    {
      status: 500,
    },
  );
}