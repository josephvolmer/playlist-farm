/**
 * Check if a user email is in the admin users list
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false

  const adminUsers = process.env.ADMIN_USERS || ""
  const adminEmails = adminUsers.split(",").map((e) => e.trim().toLowerCase())

  return adminEmails.includes(email.toLowerCase())
}
