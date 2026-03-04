"use client"

import { CreditCard, CheckCircle2, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const invoices = [
  { date: "Mar 1, 2026", amount: "$9.00", status: "paid", plan: "Pro" },
  { date: "Feb 1, 2026", amount: "$9.00", status: "paid", plan: "Pro" },
  { date: "Jan 1, 2026", amount: "$9.00", status: "paid", plan: "Pro" },
  { date: "Dec 1, 2025", amount: "$0.00", status: "free", plan: "Free" },
]

const proFeatures = [
  "50,000 auths/month",
  "Custom email branding",
  "Webhook integrations",
  "Priority support",
  "99.9% uptime SLA",
]

export default function BillingPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-sm text-slate-400">Manage your subscription and invoices</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Current Plan</CardTitle>
              <Badge>Pro</Badge>
            </div>
            <CardDescription>Your subscription renews on April 1, 2026</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">$9</span>
              <span className="text-slate-400">/month</span>
            </div>
            <Separator />
            <ul className="space-y-2">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 pt-2">
              <Button variant="outline">Change Plan</Button>
              <Button variant="ghost" className="text-red-400 hover:text-red-300">Cancel</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Usage This Month</CardTitle>
            <CardDescription>March 2026</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-400">Authentications</span>
                <span className="text-slate-200">3,240 / 50,000</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-full w-[6.5%] rounded-full bg-violet-600" />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Magic Links</span>
                <span className="text-slate-200">2,180</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">OTP Codes</span>
                <span className="text-slate-200">1,060</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">API Calls</span>
                <span className="text-slate-200">8,420</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CreditCard className="h-5 w-5 text-slate-400" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-14 items-center justify-center rounded bg-slate-800 text-xs font-bold text-slate-300">
                VISA
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Visa ending in 4242</p>
                <p className="text-xs text-slate-500">Expires 12/2028</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv, i) => (
                <TableRow key={i}>
                  <TableCell className="text-slate-300">{inv.date}</TableCell>
                  <TableCell className="text-slate-300">{inv.plan}</TableCell>
                  <TableCell className="text-slate-200">{inv.amount}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={inv.status === "paid" ? "success" : "secondary"}>{inv.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
