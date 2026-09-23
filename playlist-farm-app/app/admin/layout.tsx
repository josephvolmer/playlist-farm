import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { isAdmin } from "@/lib/admin"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth")
  }

  if (!isAdmin(session.user.email)) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header variant="dashboard" user={session.user} showThemeToggle={true} isAdmin={true} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6 flex items-center gap-6">
            <img
              src="/logo3.png"
              alt="Admin logo"
              className="w-24 h-24 opacity-90 hidden sm:block"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage users, playlists, and system settings
              </p>
            </div>
          </div>

          <div className="mb-6 border-b">
            <div className="flex gap-2">
              <Link href="/admin">
                <Button variant="ghost" className="rounded-b-none">
                  Overview
                </Button>
              </Link>
              <Link href="/admin/playlists">
                <Button variant="ghost" className="rounded-b-none">
                  Playlists
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="ghost" className="rounded-b-none">
                  Users
                </Button>
              </Link>
            </div>
          </div>

          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}
