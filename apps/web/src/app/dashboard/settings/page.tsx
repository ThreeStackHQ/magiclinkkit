"use client"

import { useState } from "react"
import { Settings, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage(): React.JSX.Element {
  const [workspaceName, setWorkspaceName] = useState("Acme Corp")
  const [fromName, setFromName] = useState("MagicLinkKit")
  const [fromEmail, setFromEmail] = useState("auth@acme.dev")
  const [replyTo, setReplyTo] = useState("support@acme.dev")
  const [linkExpiry, setLinkExpiry] = useState("15")
  const [otpExpiry, setOtpExpiry] = useState("5")
  const [saved, setSaved] = useState(false)

  function handleSave(): void {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Manage your workspace configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-slate-400" />
            Workspace
          </CardTitle>
          <CardDescription>General workspace settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>
          <div className="rounded-lg border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Workspace ID</p>
                <p className="font-mono text-sm text-slate-400">ws_8k3m9x2n4p7q1r5t</p>
              </div>
              <Badge variant="secondary">Read-only</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Email Branding</CardTitle>
          <CardDescription>Customize the appearance of authentication emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input
                id="from-name"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-email">From Email</Label>
              <Input
                id="from-email"
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reply-to">Reply-To Email</Label>
            <Input
              id="reply-to"
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Authentication Settings</CardTitle>
          <CardDescription>Configure expiry times for authentication methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Magic Link Expiry</Label>
              <Select value={linkExpiry} onValueChange={setLinkExpiry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>OTP Code Expiry</Label>
              <Select value={otpExpiry} onValueChange={setOtpExpiry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Plan Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-200">Pro Plan</p>
                <Badge>Active</Badge>
              </div>
              <p className="text-sm text-slate-400">50,000 auths/month &middot; $9/month</p>
            </div>
            <Button variant="outline">Manage Billing</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Separator />

      <Card className="border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions — proceed with caution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-red-900/30 p-4">
            <div>
              <p className="font-medium text-slate-200">Delete Workspace</p>
              <p className="text-sm text-slate-400">
                Permanently delete this workspace and all its data
              </p>
            </div>
            <Button variant="destructive">Delete Workspace</Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-red-900/30 p-4">
            <div>
              <p className="font-medium text-slate-200">Revoke All API Keys</p>
              <p className="text-sm text-slate-400">
                Immediately revoke all active API keys
              </p>
            </div>
            <Button variant="destructive">Revoke All</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
