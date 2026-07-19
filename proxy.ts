import { clerkMiddleware } from "@clerk/nextjs/server";

// Next.js 16: proxy.ts replaces middleware.ts (same clerkMiddleware API).
// Protect app/(protected) via lib/auth requireAuth in that group's layout.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
