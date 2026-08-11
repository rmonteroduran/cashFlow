import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    /*
     * Require authentication for all routes EXCEPT:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - login (login page)
     * - unauthorized (error page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|unauthorized).*)',
  ],
}
