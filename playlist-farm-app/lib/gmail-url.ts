/**
 * Generates a Gmail compose URL with pre-filled content
 * Opens a new Gmail compose window in the user's browser
 * No OAuth or authentication required
 */

interface GmailComposeParams {
  to: string
  subject: string
  body: string
  cc?: string
  bcc?: string
}

export function generateGmailComposeUrl({
  to,
  subject,
  body,
  cc,
  bcc,
}: GmailComposeParams): string {
  const params = new URLSearchParams()

  params.append('to', to)
  params.append('su', subject) // 'su' is Gmail's parameter for subject
  params.append('body', body)

  if (cc) {
    params.append('cc', cc)
  }

  if (bcc) {
    params.append('bcc', bcc)
  }

  return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`
}

/**
 * Generates a mailto: URL as fallback for non-Gmail users
 * Works with any email client
 */
export function generateMailtoUrl({
  to,
  subject,
  body,
  cc,
  bcc,
}: GmailComposeParams): string {
  const params = new URLSearchParams()

  params.append('subject', subject)
  params.append('body', body)

  if (cc) {
    params.append('cc', cc)
  }

  if (bcc) {
    params.append('bcc', bcc)
  }

  return `mailto:${to}?${params.toString()}`
}
