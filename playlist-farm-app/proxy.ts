import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname === "/auth"
    const isPublicRoute = req.nextUrl.pathname === "/"

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return null
    }

    if (!isAuth && !isPublicRoute) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return null
  },
  {
    callbacks: {
      authorized: () => true, // We handle authorization in the middleware function
    },
  }
)

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
