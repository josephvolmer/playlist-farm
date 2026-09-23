import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"
import { SmtpSettings } from "@/components/dashboard/smtp-settings"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/admin"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SignOutButton } from "@/components/dashboard/sign-out-button"

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth")
  }

  // Fetch user's SMTP settings
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      smtpHost: true,
      smtpPort: true,
      smtpUser: true,
      smtpPassword: true,
      smtpFromEmail: true,
      smtpFromName: true,
    },
  })

  const userIsAdmin = isAdmin(session.user.email)

  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" user={session.user} showThemeToggle={true} isAdmin={userIsAdmin} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center gap-6">
          <img
            src="/cassette.png"
            alt="Cassette tape"
            className="w-24 h-24 opacity-90 hidden sm:block"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Account</h1>
            <p className="text-muted-foreground">
              Manage your account settings
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "Profile"}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{session.user.name}</h2>
                  <p className="text-muted-foreground">{session.user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMTP Settings */}
          <SmtpSettings initialSettings={user || {}} />

          {/* Sign Out */}
          <div>
            <SignOutButton />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
