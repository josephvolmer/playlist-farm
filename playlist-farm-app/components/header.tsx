"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/dashboard/user-nav"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

interface HeaderProps {
  variant?: "landing" | "dashboard" | "auth"
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  showThemeToggle?: boolean
  isAdmin?: boolean
}

export function Header({ variant = "landing", user, showThemeToggle = false, isAdmin: userIsAdmin = false }: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 max-w-4xl flex justify-between items-center">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo width={32} height={32} className="h-8 w-8" />
          <span className="font-bold text-xl">PlaylistConnect</span>
        </Link>

        <nav className="flex gap-4 items-center">
          {variant === "landing" && (
            <>
              {user ? (
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/auth">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </>
          )}

          {variant === "dashboard" && user && (
            <>
              <div className="flex gap-1 mr-4">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-sm font-normal",
                      pathname === "/dashboard" && "bg-accent font-medium"
                    )}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/account">
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-sm font-normal",
                      pathname === "/dashboard/account" && "bg-accent font-medium"
                    )}
                  >
                    Account
                  </Button>
                </Link>
                {userIsAdmin && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      className={cn(
                        "text-sm font-normal",
                        pathname?.startsWith("/admin") && "bg-accent font-medium"
                      )}
                    >
                      Admin
                    </Button>
                  </Link>
                )}
              </div>
              {showThemeToggle && <ThemeToggle />}
              <UserNav user={user} />
            </>
          )}

          {variant === "auth" && showThemeToggle && <ThemeToggle />}
        </nav>
      </div>
    </header>
  )
}
