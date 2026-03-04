"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Link2,
  Fingerprint,
  Webhook,
  Shield,
  Zap,
  CheckCircle2,
  Menu,
  X,
  ArrowRight,
  Code2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Link2,
    title: "Magic Links",
    description: "Passwordless email authentication with one-click sign-in links.",
  },
  {
    icon: Fingerprint,
    title: "OTP Codes",
    description: "Time-based one-time passwords delivered via email or SMS.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Rate limiting, IP allowlists, and HMAC-signed webhooks.",
  },
  {
    icon: Zap,
    title: "Sub-200ms Latency",
    description: "Global edge delivery ensures instant authentication experiences.",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Real-time event notifications for auth.success, auth.failed, and more.",
  },
  {
    icon: Code2,
    title: "Simple API",
    description: "RESTful API with SDKs for Node.js, Python, Go, and more.",
  },
]

const comparisonRows = [
  { feature: "Magic Links", mlk: true, auth0: true, passage: true },
  { feature: "OTP Codes", mlk: true, auth0: true, passage: false },
  { feature: "Webhooks", mlk: true, auth0: true, passage: true },
  { feature: "Custom Branding", mlk: true, auth0: "Paid", passage: true },
  { feature: "Sub-200ms Latency", mlk: true, auth0: false, passage: true },
  { feature: "No Per-User Pricing", mlk: true, auth0: false, passage: false },
  { feature: "Starting Price", mlk: "$9/mo", auth0: "$23+/mo", passage: "$29+/mo" },
]

interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  popular: boolean
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For side projects and experimentation",
    features: [
      "1,000 auths/month",
      "Magic Links & OTP",
      "1 API key",
      "Community support",
      "Basic analytics",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For growing products that need more",
    features: [
      "50,000 auths/month",
      "Magic Links & OTP",
      "Unlimited API keys",
      "Custom email branding",
      "Webhooks",
      "Priority support",
      "99.9% uptime SLA",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/month",
    description: "For teams shipping auth at scale",
    features: [
      "Unlimited auths",
      "Everything in Pro",
      "Custom domain",
      "Dedicated IP",
      "SSO / SAML",
      "Audit logs",
      "Dedicated support",
      "99.99% uptime SLA",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

const stats = [
  { value: "12M+", label: "Auths Processed" },
  { value: "99.99%", label: "Uptime" },
  { value: "<120ms", label: "Avg Latency" },
  { value: "2,400+", label: "Developers" },
]

function CellValue({ value }: { value: boolean | string }): React.JSX.Element {
  if (value === true) return <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-400" />
  if (value === false) return <X className="mx-auto h-5 w-5 text-slate-600" />
  return <span className="text-slate-300">{value}</span>
}

export default function LandingPage(): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-violet-600" />
            <span className="text-lg font-bold text-white">MagicLinkKit</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-slate-400 transition-colors hover:text-white">Features</a>
            <a href="#pricing" className="text-sm text-slate-400 transition-colors hover:text-white">Pricing</a>
            <a href="#comparison" className="text-sm text-slate-400 transition-colors hover:text-white">Compare</a>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-slate-800 px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <a href="#features" className="text-sm text-slate-400" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="text-sm text-slate-400" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#comparison" className="text-sm text-slate-400" onClick={() => setMobileMenuOpen(false)}>Compare</a>
              <Link href="/dashboard">
                <Button className="w-full" size="sm">Get Started</Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-600/30 bg-violet-600/10 px-4 py-1.5 text-sm text-violet-300">
            <Zap className="h-4 w-4" />
            Passwordless auth in 5 minutes
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Magic Links & OTP{" "}
            <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              as a Service
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Drop-in passwordless authentication for your app. Send magic links and OTP codes
            with a single API call. No passwords, no friction, no complexity.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 px-8">
                Start Building Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="px-8">
                See How It Works
              </Button>
            </a>
          </div>
          <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-slate-500">auth.ts</span>
            </div>
            <pre className="overflow-x-auto p-4 text-left text-sm leading-relaxed">
              <code>
                <span className="text-violet-400">const</span>{" "}
                <span className="text-slate-200">response</span>{" "}
                <span className="text-slate-500">=</span>{" "}
                <span className="text-violet-400">await</span>{" "}
                <span className="text-amber-300">fetch</span>
                <span className="text-slate-400">(</span>
                <span className="text-emerald-400">&quot;https://api.magiclinkkit.com/v1/auth/magic-link&quot;</span>
                <span className="text-slate-400">,</span> {`{`}{"\n"}
                {"  "}method: <span className="text-emerald-400">&quot;POST&quot;</span>,{"\n"}
                {"  "}headers: {`{`} <span className="text-emerald-400">&quot;Authorization&quot;</span>: <span className="text-emerald-400">{"`"}Bearer {"${API_KEY}"}{"`"}</span> {`}`},{"\n"}
                {"  "}body: <span className="text-amber-300">JSON.stringify</span>({`{`}{"\n"}
                {"    "}email: <span className="text-emerald-400">&quot;user@example.com&quot;</span>,{"\n"}
                {"    "}redirect_url: <span className="text-emerald-400">&quot;https://app.example.com/callback&quot;</span>{"\n"}
                {"  "}{`}`}){"\n"}
                {`}`}<span className="text-slate-400">)</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything you need for passwordless auth
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              A complete authentication toolkit that handles the complexity so you can focus on your product.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-colors hover:border-violet-600/50"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/10">
                    <Icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="border-t border-slate-800 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Why MagicLinkKit?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              More features, simpler pricing, better developer experience.
            </p>
          </div>
          <div className="mt-12 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Feature</th>
                  <th className="px-4 py-3 text-center font-medium text-violet-400">MagicLinkKit $9</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-400">Auth0 $23+</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-400">Passage $29+</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-slate-300">{row.feature}</td>
                    <td className="px-4 py-3 text-center"><CellValue value={row.mlk} /></td>
                    <td className="px-4 py-3 text-center"><CellValue value={row.auth0} /></td>
                    <td className="px-4 py-3 text-center"><CellValue value={row.passage} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-slate-800 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Simple, predictable pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              No per-user fees. No surprise bills. Just honest pricing for every stage of growth.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "relative flex flex-col rounded-xl border p-8",
                  tier.popular
                    ? "border-violet-600 bg-slate-900 shadow-lg shadow-violet-600/10"
                    : "border-slate-800 bg-slate-900/50"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{tier.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    <span className="text-slate-400">{tier.period}</span>
                  </div>
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard">
                  <Button
                    variant={tier.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-800 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to go passwordless?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Join 2,400+ developers who ship authentication in minutes, not weeks.
          </p>
          <div className="mt-8">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 px-8">
                Start Building Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-violet-600" />
                <span className="font-bold text-white">MagicLinkKit</span>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Passwordless authentication as a service. Magic links and OTP codes for modern apps.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#comparison" className="hover:text-white">Compare</a></li>
                <li><a href="#" className="hover:text-white">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Developers</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">SDKs</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} MagicLinkKit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
