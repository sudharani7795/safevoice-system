import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { FlaskConical, Menu, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Live Dashboard' },
  { to: '/report', label: 'Report a Crime' },
  { to: '/guide', label: 'Setup Guide' },
] as const

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 rounded-md font-display text-lg font-bold tracking-tight ${className}`}
    >
      <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-sv-blue via-sv-purple to-sv-red shadow-lg shadow-sv-purple/30">
        <svg viewBox="0 0 24 24" className="size-5 text-white" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2.5 4.5 5.4v6.1c0 4.7 3.2 8.6 7.5 10 4.3-1.4 7.5-5.3 7.5-10V5.4L12 2.5Z"
            opacity=".35"
          />
          <rect x="10.4" y="6.5" width="3.2" height="7" rx="1.6" fill="currentColor" />
          <path
            d="M8.6 11.6a3.4 3.4 0 0 0 6.8 0M12 15v2.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      Safe<span className="sv-gradient-text">Voice</span>
    </Link>
  )
}

export function DemoBanner() {
  return (
    <div className="border-b border-sv-amber/30 bg-sv-amber/10 text-sv-amber">
      <div className="mx-auto flex max-w-content items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-medium sm:px-6">
        <FlaskConical className="size-3.5 shrink-0" aria-hidden="true" />
        Demo mode — no real alerts, SMS, or emails are ever sent. Data shown is
        fictional and stays in this browser.
      </div>
    </div>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40">
      <DemoBanner />
      <div className="border-b border-white/5 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none"
                activeProps={{ className: 'text-foreground bg-white/5' }}
                activeOptions={{ exact: true }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              className="hidden bg-sv-red text-white hover:bg-sv-red/90 sm:inline-flex"
            >
              <Link to="/dashboard" hash="sos">
                SOS
              </Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background">
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                  <SheetDescription>Navigate SafeVoice</SheetDescription>
                </SheetHeader>
                <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                  {nav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-3 text-base text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      activeProps={{ className: 'text-foreground bg-white/5' }}
                      activeOptions={{ exact: true }}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Button
                    asChild
                    className="mt-4 bg-sv-red text-white hover:bg-sv-red/90"
                  >
                    <Link to="/dashboard" hash="sos" onClick={() => setOpen(false)}>
                      Open SOS
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-black/20">
      <div className="mx-auto grid max-w-content gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">
            A privacy-first emergency assistant and private crime reporting
            space.
          </p>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold">
            Safety information
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              In immediate danger, call your local emergency number first
              (112 in India and the EU, 911 in the US).
            </li>
            <li>Women helpline (India): 181</li>
            <li>
              SafeVoice is not connected to police services and does not
              replace them.
            </li>
          </ul>
        </div>
        <div id="privacy">
          <h2 className="font-display text-sm font-semibold">Privacy policy</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Your keyword is matched in the browser; SafeVoice never records or uploads conversations.</li>
            <li>Location is read only after you allow it and only while you share it.</li>
            <li>Your reports are visible only to you and authorized reviewers.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a className="hover:text-foreground" href="mailto:support@safevoice.example">
                support@safevoice.example
              </a>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-sv-green" aria-hidden="true" />
              Responsible disclosure: security@safevoice.example
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SafeVoice. Demo build — emergency
        delivery is not yet operational.
      </div>
    </footer>
  )
}
