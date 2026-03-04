"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Link2,
  KeyRound,
  Webhook,
  Settings,
  CreditCard,
  Activity,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Fingerprint,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Magic Links", href: "/dashboard/magic-links", icon: Link2 },
  { label: "OTP", href: "/dashboard/otp", icon: Fingerprint },
  { label: "Activity", href: "/dashboard/activity", icon: Activity },
  { label: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
  { label: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-4">
        <Link2 className="h-6 w-6 text-violet-600" />
        <span className="text-lg font-bold text-white">MagicLinkKit</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <div className="rounded-lg bg-slate-800/50 p-3">
          <p className="text-xs text-slate-400">Current plan</p>
          <p className="text-sm font-medium text-white">Pro Plan</p>
          <p className="text-xs text-slate-500">1,240 / 50,000 auths</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900 lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 bg-slate-900">
            <div className="absolute right-2 top-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden lg:block" />
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                J
              </div>
              <span className="hidden sm:inline">john@acme.dev</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-800 bg-slate-900 py-1 shadow-lg">
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
