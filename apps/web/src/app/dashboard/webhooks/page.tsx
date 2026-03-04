"use client"

import { useState } from "react"
import { Webhook, Plus, Trash2, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  createdAt: string
  status: "active" | "failing"
}

interface DeliveryLog {
  id: string
  endpoint: string
  event: string
  status: "delivered" | "failed" | "pending"
  statusCode: number | null
  timestamp: string
  duration: string
}

const initialEndpoints: WebhookEndpoint[] = [
  {
    id: "1",
    url: "https://api.acme.dev/webhooks/auth",
    events: ["auth.success", "auth.failed"],
    createdAt: "Feb 10, 2026",
    status: "active",
  },
  {
    id: "2",
    url: "https://hooks.slack.com/services/T01/B02/abc",
    events: ["auth.failed", "auth.expired"],
    createdAt: "Jan 5, 2026",
    status: "failing",
  },
]

const deliveryLogs: DeliveryLog[] = [
  { id: "1", endpoint: "api.acme.dev", event: "auth.success", status: "delivered", statusCode: 200, timestamp: "2 min ago", duration: "120ms" },
  { id: "2", endpoint: "api.acme.dev", event: "auth.success", status: "delivered", statusCode: 200, timestamp: "5 min ago", duration: "95ms" },
  { id: "3", endpoint: "hooks.slack.com", event: "auth.failed", status: "failed", statusCode: 500, timestamp: "8 min ago", duration: "2,100ms" },
  { id: "4", endpoint: "api.acme.dev", event: "auth.failed", status: "delivered", statusCode: 200, timestamp: "15 min ago", duration: "110ms" },
  { id: "5", endpoint: "hooks.slack.com", event: "auth.expired", status: "failed", statusCode: null, timestamp: "22 min ago", duration: "timeout" },
  { id: "6", endpoint: "api.acme.dev", event: "auth.success", status: "delivered", statusCode: 200, timestamp: "30 min ago", duration: "88ms" },
  { id: "7", endpoint: "api.acme.dev", event: "auth.success", status: "delivered", statusCode: 200, timestamp: "45 min ago", duration: "102ms" },
  { id: "8", endpoint: "hooks.slack.com", event: "auth.failed", status: "pending", statusCode: null, timestamp: "1 hr ago", duration: "—" },
]

const eventOptions = [
  { id: "auth.success", label: "auth.success" },
  { id: "auth.failed", label: "auth.failed" },
  { id: "auth.expired", label: "auth.expired" },
]

export default function WebhooksPage(): React.JSX.Element {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>(initialEndpoints)
  const [newUrl, setNewUrl] = useState("")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)

  function toggleEvent(eventId: string): void {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    )
  }

  function handleAdd(): void {
    if (!newUrl.trim() || selectedEvents.length === 0) return
    const endpoint: WebhookEndpoint = {
      id: String(endpoints.length + 1),
      url: newUrl,
      events: selectedEvents,
      createdAt: "Mar 4, 2026",
      status: "active",
    }
    setEndpoints([...endpoints, endpoint])
    setNewUrl("")
    setSelectedEvents([])
    setShowForm(false)
  }

  function handleDelete(id: string): void {
    setEndpoints(endpoints.filter((e) => e.id !== id))
  }

  const deliveryStatusIcon = {
    delivered: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    failed: <XCircle className="h-4 w-4 text-red-400" />,
    pending: <Clock className="h-4 w-4 text-amber-400" />,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Webhooks</h1>
          <p className="text-sm text-slate-400">Get notified when authentication events occur</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Endpoint
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white">New Webhook Endpoint</CardTitle>
            <CardDescription>We&apos;ll send a POST request to your URL when events occur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://api.yourapp.com/webhooks"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label>Events to subscribe</Label>
              {eventOptions.map((event) => (
                <div key={event.id} className="flex items-center gap-2">
                  <Checkbox
                    id={event.id}
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => toggleEvent(event.id)}
                  />
                  <label htmlFor={event.id} className="text-sm text-slate-300 cursor-pointer">
                    {event.label}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={!newUrl.trim() || selectedEvents.length === 0}>
                Save Endpoint
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Webhook className="h-5 w-5 text-slate-400" />
            Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints.map((ep) => (
                <TableRow key={ep.id}>
                  <TableCell className="max-w-[200px] truncate font-mono text-sm text-slate-200">
                    {ep.url}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ep.events.map((ev) => (
                        <Badge key={ev} variant="secondary" className="text-xs">{ev}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-slate-400 sm:table-cell">{ep.createdAt}</TableCell>
                  <TableCell>
                    <Badge variant={ep.status === "active" ? "success" : "destructive"}>
                      {ep.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(ep.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {endpoints.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-slate-500">
                    No webhook endpoints configured
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Recent Deliveries</CardTitle>
          <CardDescription>Webhook delivery attempts from the last hour</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="hidden sm:table-cell">HTTP</TableHead>
                <TableHead className="hidden sm:table-cell">Duration</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{deliveryStatusIcon[log.status]}</TableCell>
                  <TableCell className="font-mono text-sm text-slate-300">{log.endpoint}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{log.event}</Badge>
                  </TableCell>
                  <TableCell className="hidden text-slate-400 sm:table-cell">
                    {log.statusCode ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-slate-400 sm:table-cell">{log.duration}</TableCell>
                  <TableCell className="text-right text-slate-400">{log.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
