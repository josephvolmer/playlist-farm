"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, Mail, Save, Trash2 } from "lucide-react"
import { generateGmailComposeUrl, generateMailtoUrl } from "@/lib/gmail-url"

interface EmailTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trackName: string
  trackUrl: string
  artistName: string
  playlistName: string
  curatorName: string
  curatorEmail: string | null
  submissionNotes?: string | null
}

export function EmailTemplateModal({
  open,
  onOpenChange,
  trackName,
  trackUrl,
  artistName,
  playlistName,
  curatorName,
  curatorEmail,
  submissionNotes,
}: EmailTemplateModalProps) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  // Create a unique key for this draft based on playlist and track
  const getDraftKey = () => `draft_${playlistName}_${trackName}`.replace(/[^a-zA-Z0-9_]/g, '_')

  const generateEmail = () => {
    const subject = `Submission for ${playlistName}`

    // Ensure the trackUrl is a complete URL with https://
    const formattedTrackUrl = trackUrl.startsWith('http') ? trackUrl : `https://${trackUrl}`

    const body = `Hi ${curatorName},

I hope this email finds you well! I'm ${artistName}, and I'm reaching out to submit my track "${trackName}" for consideration for your playlist "${playlistName}".

${submissionNotes ? `I've read your submission notes: "${submissionNotes}"\n\n` : ""}I believe this track would be a great fit for your playlist based on its style and vibe. You can listen to it here:

<${formattedTrackUrl}>

I'd love to hear what you think, and I'm happy to provide any additional information you might need.

Thank you for taking the time to listen!

Best regards,
${artistName}`

    return { subject, body }
  }

  const initialEmail = generateEmail()
  const [subject, setSubject] = useState(initialEmail.subject)
  const [body, setBody] = useState(initialEmail.body)

  // Load draft from localStorage or reset when modal opens
  useEffect(() => {
    if (open) {
      const draftKey = getDraftKey()
      const savedDraft = localStorage.getItem(draftKey)

      if (savedDraft) {
        try {
          const { subject: savedSubject, body: savedBody } = JSON.parse(savedDraft)
          setSubject(savedSubject)
          setBody(savedBody)
        } catch (e) {
          // If parsing fails, generate fresh email
          const freshEmail = generateEmail()
          setSubject(freshEmail.subject)
          setBody(freshEmail.body)
        }
      } else {
        // No saved draft, generate fresh email
        const freshEmail = generateEmail()
        setSubject(freshEmail.subject)
        setBody(freshEmail.body)
      }

      setCopied(false)
      setSaved(false)
    }
  }, [open, playlistName, trackName])

  // Save draft to localStorage
  const handleSaveDraft = () => {
    const draftKey = getDraftKey()
    const draft = { subject, body }
    localStorage.setItem(draftKey, JSON.stringify(draft))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Delete draft from localStorage
  const handleDeleteDraft = () => {
    const draftKey = getDraftKey()
    localStorage.removeItem(draftKey)

    // Reset to fresh email
    const freshEmail = generateEmail()
    setSubject(freshEmail.subject)
    setBody(freshEmail.body)
  }

  const handleCopy = () => {
    const fullEmail = `Subject: ${subject}\n\n${body}`
    navigator.clipboard.writeText(fullEmail)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenGmail = () => {
    if (!curatorEmail) {
      alert("No curator email available")
      return
    }

    const gmailUrl = generateGmailComposeUrl({
      to: curatorEmail,
      subject,
      body,
    })

    window.open(gmailUrl, '_blank')
  }

  const handleOpenEmail = () => {
    if (!curatorEmail) {
      alert("No curator email available")
      return
    }

    const mailtoUrl = generateMailtoUrl({
      to: curatorEmail,
      subject,
      body,
    })

    window.location.href = mailtoUrl
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle>Draft Pitch Email</DialogTitle>
          <DialogDescription>
            Copy this template, open in Gmail, or use your default email client
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Subject Line:</label>
            <Textarea
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email Body:</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 font-mono text-sm"
              rows={15}
            />
          </div>

          {curatorEmail && (
            <div className="bg-muted p-3 rounded">
              <p className="text-sm">
                <strong>Curator Email:</strong> {curatorEmail}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleSaveDraft} variant="secondary" className="gap-2">
                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Draft
                  </>
                )}
              </Button>
              <Button onClick={handleDeleteDraft} variant="outline" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Reset Draft
              </Button>
            </div>

            <Button onClick={handleCopy} className="w-full gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Email
                </>
              )}
            </Button>

            {curatorEmail && (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleOpenGmail} variant="default" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Open in Gmail
                </Button>
                <Button onClick={handleOpenEmail} variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Other Email
                </Button>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Feel free to personalize this template before sending. Adding your own
            touch can make your pitch more authentic and memorable.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
