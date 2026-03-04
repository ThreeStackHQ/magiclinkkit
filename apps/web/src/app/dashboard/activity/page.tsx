"use client"

import { useState } from "react"
import { Activity, ChevronLeft, ChevronRight } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const chartData = [
  { day: "Mon", magicLink: 120, otp: 45 },
  { day: "Tue", magicLink: 132, otp: 52 },
  { day: "Wed", magicLink: 101, otp: 38 },
  { day: "Thu", magicLink: 134, otp: 60 },
  { day: "Fri", magicLink: 190, otp: 72 },
  { day: "Sat", magicLink: 68, otp: 20 },
  { day: "Sun", magicLink: 45, otp: 15 },
]

interface ActivityRow {
  id: number
  email: string
  type: "magic-link" | "otp"
  status: "success" | "failed" | "expired"
  ip: string
  timestamp: string
}

function generateMockData(): ActivityRow[] {
  const emails = [
    "sarah@acme.dev", "mike@startup.io", "lisa@corp.com", "alex@design.co",
    "emma@shop.dev", "tom@agency.io", "nina@saas.app", "dave@cloud.co",
    "kate@web.dev", "ryan@tech.io", "jane@ops.co", "paul@data.dev",
    "amy@ml.io", "chris@devops.co", "mia@infra.dev", "luke@api.io",
    "zoe@ux.dev", "jack@eng.co", "lily@platform.io", "mark@build.dev",
  ]
  const types: Array<"magic-link" | "otp"> = ["magic-link", "otp"]
  const statuses: Array<"success" | "failed" | "expired"> = ["success", "success", "success", "failed", "expired"]
  const ips = [
    "192.168.1.42", "10.0.0.15", "172.16.0.88", "203.0.113.50",
    "198.51.100.23", "192.0.2.1", "10.10.10.10", "172.31.0.99",
  ]

  return emails.map((email, i) => ({
    id: i + 1,
    email,
    type: types[i % types.length],
    status: statuses[i % statuses.length],
    ip: ips[i % ips.length],
    timestamp: `Mar ${String(4 - Math.floor(i / 5)).padStart(1, "0")}, 2026 ${String(14 - i % 12).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
  }))
}

const allRows = generateMockData()
const PAGE_SIZE = 10

export default function ActivityPage(): React.JSX.Element {
  const [page, setPage] = useState(0)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = allRows.filter((row) => {
    if (typeFilter !== "all" && row.type !== typeFilter) return false
    if (statusFilter !== "all" && row.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const typeBadgeVariant = {
    "magic-link": "default" as const,
    otp: "secondary" as const,
  }

  const statusBadgeVariant = {
    success: "success" as const,
    failed: "destructive" as const,
    expired: "outline" as const,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity</h1>
        <p className="text-sm text-slate-400">Authentication events over time</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-slate-400" />
            Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="magicLink" name="Magic Link" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="otp" name="OTP" fill="#475569" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-white">Event Log</CardTitle>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0) }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="magic-link">Magic Link</SelectItem>
                  <SelectItem value="otp">OTP</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0) }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">IP Address</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-slate-200">{row.email}</TableCell>
                  <TableCell>
                    <Badge variant={typeBadgeVariant[row.type]}>{row.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[row.status]}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden font-mono text-sm text-slate-400 sm:table-cell">
                    {row.ip}
                  </TableCell>
                  <TableCell className="text-right text-slate-400">{row.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
