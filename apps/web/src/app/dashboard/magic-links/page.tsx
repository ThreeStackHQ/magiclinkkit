"use client"

import { Link2, Clock, Mail, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const recentLinks = [
  { email: "sarah@acme.dev", status: "clicked", sentAt: "2 min ago", expiresIn: "13 min" },
  { email: "mike@startup.io", status: "pending", sentAt: "5 min ago", expiresIn: "10 min" },
  { email: "lisa@corp.com", status: "expired", sentAt: "20 min ago", expiresIn: "—" },
  { email: "alex@design.co", status: "clicked", sentAt: "35 min ago", expiresIn: "—" },
  { email: "emma@shop.dev", status: "pending", sentAt: "1 min ago", expiresIn: "14 min" },
]

const statusVariant = {
  clicked: "success" as const,
  pending: "default" as const,
  expired: "destructive" as const,
}

export default function MagicLinksPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Magic Links</h1>
          <p className="text-sm text-slate-400">Passwordless authentication via email links</p>
        </div>
        <Button>
          <Mail className="mr-2 h-4 w-4" />
          Send Test Link
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Sent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">89</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">94.2%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Avg Time to Click</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">48s</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Link2 className="h-5 w-5 text-slate-400" />
            Recent Magic Links
          </CardTitle>
          <CardDescription>Last 5 magic link requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="text-right">Expires In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLinks.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-slate-200">{row.email}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[row.status as keyof typeof statusVariant]}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-400">{row.sentAt}</TableCell>
                  <TableCell className="text-right text-slate-400">{row.expiresIn}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Integration Guide</CardTitle>
          <CardDescription>Get started with magic link authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-slate-800 p-4">
            <code className="text-sm text-slate-300">
              <span className="text-violet-400">POST</span> /api/v1/auth/magic-link
            </code>
            <pre className="mt-2 text-xs text-slate-500">
{`{
  "email": "user@example.com",
  "redirect_url": "https://app.example.com/callback"
}`}
            </pre>
          </div>
          <Button variant="outline" className="gap-2">
            View Full Docs <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
