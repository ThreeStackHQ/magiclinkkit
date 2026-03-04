"use client"

import { useState } from "react"
import { KeyRound, Plus, Copy, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ApiKey {
  id: string
  name: string
  prefix: string
  createdAt: string
  lastUsed: string
  status: "active" | "revoked"
}

const initialKeys: ApiKey[] = [
  { id: "1", name: "Production", prefix: "mlk_live_7Kx9", createdAt: "Feb 15, 2026", lastUsed: "2 min ago", status: "active" },
  { id: "2", name: "Staging", prefix: "mlk_test_3Qm2", createdAt: "Jan 20, 2026", lastUsed: "1 hr ago", status: "active" },
  { id: "3", name: "Development", prefix: "mlk_test_8Rn4", createdAt: "Dec 1, 2025", lastUsed: "3 days ago", status: "active" },
  { id: "4", name: "Old key", prefix: "mlk_live_1Zp5", createdAt: "Nov 10, 2025", lastUsed: "Never", status: "revoked" },
]

export default function ApiKeysPage(): React.JSX.Element {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCreate(): void {
    if (!newKeyName.trim()) return
    const fakeKey = `mlk_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 30)}`
    setGeneratedKey(fakeKey)
    const newEntry: ApiKey = {
      id: String(keys.length + 1),
      name: newKeyName,
      prefix: fakeKey.slice(0, 13),
      createdAt: "Mar 4, 2026",
      lastUsed: "Never",
      status: "active",
    }
    setKeys([newEntry, ...keys])
  }

  function handleCopy(): void {
    if (generatedKey) {
      void navigator.clipboard.writeText(generatedKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleDialogClose(): void {
    setDialogOpen(false)
    setNewKeyName("")
    setGeneratedKey(null)
    setShowKey(false)
    setCopied(false)
  }

  function handleRevoke(id: string): void {
    setKeys(keys.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-sm text-slate-400">Manage your API keys for authentication</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); else setDialogOpen(true) }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                {generatedKey
                  ? "Your API key has been created. Copy it now — you won't be able to see it again."
                  : "Give your key a name to help you identify it later."}
              </DialogDescription>
            </DialogHeader>
            {!generatedKey ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g. Production, Staging"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={!newKeyName.trim()}>Generate Key</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-lg border border-amber-600/30 bg-amber-950/30 p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                    <p className="text-sm text-amber-200">
                      This key will only be shown once. Store it securely.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      type={showKey ? "text" : "password"}
                      value={generatedKey}
                      className="font-mono text-xs"
                    />
                    <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleCopy}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {copied && <p className="text-xs text-emerald-400">Copied to clipboard!</p>}
                </div>
                <DialogFooter>
                  <Button onClick={handleDialogClose}>Done</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <KeyRound className="h-5 w-5 text-slate-400" />
            Your API Keys
          </CardTitle>
          <CardDescription>Use these keys to authenticate API requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="hidden sm:table-cell">Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium text-slate-200">{key.name}</TableCell>
                  <TableCell className="font-mono text-sm text-slate-400">{key.prefix}••••</TableCell>
                  <TableCell className="hidden text-slate-400 sm:table-cell">{key.createdAt}</TableCell>
                  <TableCell className="hidden text-slate-400 sm:table-cell">{key.lastUsed}</TableCell>
                  <TableCell>
                    <Badge variant={key.status === "active" ? "success" : "destructive"}>
                      {key.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {key.status === "active" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleRevoke(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
