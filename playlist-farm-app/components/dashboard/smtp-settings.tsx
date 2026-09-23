"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Mail, Save, Loader2 } from "lucide-react"

interface SmtpSettings {
  smtpHost?: string | null
  smtpPort?: number | null
  smtpUser?: string | null
  smtpPassword?: string | null
  smtpFromEmail?: string | null
  smtpFromName?: string | null
}

interface SmtpSettingsProps {
  initialSettings: SmtpSettings
}

export function SmtpSettings({ initialSettings }: SmtpSettingsProps) {
  const [settings, setSettings] = useState<SmtpSettings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")

    try {
      const response = await fetch("/api/user/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to save SMTP settings")
      }

      setMessage("SMTP settings saved successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Error saving settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          SMTP Settings
        </CardTitle>
        <CardDescription>
          Configure your SMTP server to send emails directly from the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtpHost">SMTP Host</Label>
            <Input
              id="smtpHost"
              placeholder="smtp.gmail.com"
              value={settings.smtpHost || ""}
              onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpPort">SMTP Port</Label>
            <Input
              id="smtpPort"
              type="number"
              placeholder="587"
              value={settings.smtpPort || ""}
              onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || null })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtpUser">SMTP Username</Label>
          <Input
            id="smtpUser"
            placeholder="your@email.com"
            value={settings.smtpUser || ""}
            onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtpPassword">SMTP Password</Label>
          <Input
            id="smtpPassword"
            type="password"
            placeholder="••••••••"
            value={settings.smtpPassword || ""}
            onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            For Gmail, use an App Password instead of your regular password
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtpFromEmail">From Email</Label>
            <Input
              id="smtpFromEmail"
              placeholder="your@email.com"
              value={settings.smtpFromEmail || ""}
              onChange={(e) => setSettings({ ...settings, smtpFromEmail: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpFromName">From Name</Label>
            <Input
              id="smtpFromName"
              placeholder="Your Name"
              value={settings.smtpFromName || ""}
              onChange={(e) => setSettings({ ...settings, smtpFromName: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
          {message && (
            <span className={`text-sm ${message.includes("Error") ? "text-destructive" : "text-green-600"}`}>
              {message}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
