import { auth } from "@/lib/auth-helper"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/admin"
import DashboardClient from "@/components/dashboard/dashboard-client"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  })

  if (!user) {
    redirect("/auth")
  }

  const userIsAdmin = isAdmin(user.email)

  return <DashboardClient user={user} isAdmin={userIsAdmin} />
}
