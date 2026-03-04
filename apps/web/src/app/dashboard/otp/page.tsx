"use client"

import { Fingerprint, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const recentOtps = [
  { email: "sarah@acme.dev", status: "verified", sentAt: "1 min ago", code: "••••42" },
  { email: "mike@startup.io", status: "pending", sentAt: "3 min ago", code: "••••17" },
  { email: "lisa@corp.com", status: "expired", sentAt: "12 min ago", code: "••••89" },
  { email: "alex@design.co", status: "verified", sentAt: "22 min ago", code: "••••03" },
  { email: "emma@shop.dev", status: "failed", sentAt: "30 min ago", code: "••••56" },
]

const statusVariant = {
  verified: "success" as const,
  pending: "default" as const,
  expired: "secondary" as const,
  failed: "destructive" as const,
}

export default function OtpPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">OTP Codes</h1>
          <p className="text-sm text-slate-400">One-time password authentication via email or SMS</p>
        </div>
        <Button>
          <Fingerprint className="mr-2 h-4 w-4" />
          Send Test OTP
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Sent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">53</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Verify Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">91.8%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Avg Verify Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">23s</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Fingerprint className="h-5 w-5 text-slate-400" />
            Recent OTP Requests
          </CardTitle>
          <CardDescription>Last 5 OTP verifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOtps.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-slate-200">{row.email}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[row.status as keyof typeof statusVariant]}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-slate-400">{row.code}</TableCell>
                  <TableCell className="text-right text-slate-400">{row.sentAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Integration Guide</CardTitle>
          <CardDescription>Get started with OTP authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-slate-800 p-4">
            <code className="text-sm text-slate-300">
              <span className="text-violet-400">POST</span> /api/v1/auth/otp/send
            </code>
            <pre className="mt-2 text-xs text-slate-500">
{`{
  "email": "user@example.com",
  "channel": "email"
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
