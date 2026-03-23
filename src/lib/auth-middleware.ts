import { NextResponse } from "next/server";
import { auth } from "./auth";

type UserRole = "admin" | "moderator" | "author" | "seller" | "member";

/**
 * Get the current session, or return null if unauthenticated.
 * If `roles` is provided, also checks that the user has one of the allowed roles.
 * Throws a redirect/error for use in Server Components and Server Actions.
 */
export async function getRequiredSession(roles?: UserRole[]) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthenticated");
  }

  if (roles && roles.length > 0 && !roles.includes(session.user.role)) {
    throw new Error("Forbidden");
  }

  return session;
}

/**
 * Higher-order function for API route protection.
 * Wraps a route handler to check authentication and role authorization.
 * Returns 401 if unauthenticated, 403 if unauthorized.
 */
export function withRole(allowedRoles: UserRole[]) {
  return function <T>(
    handler: (
      request: Request,
      context: T
    ) => Promise<Response> | Response
  ) {
    return async (request: Request, context: T) => {
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthenticated" },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(session.user.role)) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      return handler(request, context);
    };
  };
}
