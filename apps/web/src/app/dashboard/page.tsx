"use client"

import { Shield, TrendingUp, Calendar, CheckCircle2, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface KpiCard {
  title: string
  value: string
  icon: React.ElementType
  change: string
}

const kpiCards: KpiCard[] = [
  { title: "Auths Today", value: "142", icon: Shield, change: "+12% vs yesterday" },
  { title: "Auths This Week", value: "891", icon: TrendingUp, change: "+8% vs last week" },
  { title: "Auths This Month", value: "3,240", icon: Calendar, change: "+23% vs last month" },
  { title: "Success Rate", value: "97.3%", icon: CheckCircle2, change: "+0.5% vs last month" },
]

interface AuthEmail {
  email: string
  count: number
  lastAuth: string
  method: "magic-link" | "otp"
}

const topEmails: AuthEmail[] = [
  { email: "sarah@acme.dev", count: 34, lastAuth: "2 min ago", method: "magic-link" },
  { email: "mike@startup.io", count: 28, lastAuth: "5 min ago", method: "magic-link" },
  { email: "lisa@corp.com", count: 22, lastAuth: "12 min ago", method: "otp" },
  { email: "alex@design.co", count: 19, lastAuth: "18 min ago", method: "magic-link" },
  { email: "emma@shop.dev", count: 17, lastAuth: "25 min ago", method: "otp" },
  { email: "tom@agency.io", count: 15, lastAuth: "32 min ago", method: "magic-link" },
  { email: "nina@saas.app", count: 12, lastAuth: "45 min ago", method: "magic-link" },
  { email: "dave@cloud.co", count: 10, lastAuth: "1 hr ago", method: "otp" },
]

export default function DashboardOverview(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-sm text-slate-400">Your authentication metrics at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{kpi.value}</div>
                <p className="text-xs text-emerald-400">{kpi.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5 text-slate-400" />
            Top Auth Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Auths</TableHead>
                <TableHead className="text-right">Last Auth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topEmails.map((row) => (
                <TableRow key={row.email}>
                  <TableCell className="font-medium text-slate-200">{row.email}</TableCell>
                  <TableCell>
                    <Badge variant={row.method === "magic-link" ? "default" : "secondary"}>
                      {row.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-300">{row.count}</TableCell>
                  <TableCell className="text-right text-slate-400">{row.lastAuth}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
