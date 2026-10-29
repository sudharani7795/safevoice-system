import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  Crosshair,
  FlaskConical,
  MapPin,
  MapPinOff,
  Mic,
  MicOff,
  ShieldAlert,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ContactsManager } from '@/components/contacts-manager'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { useGeolocation, type GeoFix } from '@/hooks/use-geolocation'
import { normalize, useVoiceKeyword } from '@/hooks/use-voice-keyword'
import {
  DEMO_USER,
  demoAlerts,
  demoContacts,
  type AlertEvent,
  type DeliveryStatus,
  type EmergencyContact,
} from '@/lib/fixtures'

export const Route = createFileRoute('/dashboard')({
  head: () => ({ meta: [{ title: 'Live Dashboard · SafeVoice' }] }),
  component: Dashboard,
})

const COUNTDOWN_SECONDS = 10

function channelsFor(channel: EmergencyContact['channel']): ('sms' | 'email')[] {
  return channel === 'both' ? ['sms', 'email'] : [channel]
}
const KEYWORD_STORAGE = 'safevoice:keyword'

function Panel({
  title,
  icon: Icon,
  status,
  children,
  className = '',
  id,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  status?: React.ReactNode
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} aria-label={title} className={`sv-glass rounded-2xl p-5 sm:p-6 ${className}`}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          {title}
        </h2>
        {status}
      </header>
      {children}
    </section>
  )
}

function StatusDot({ tone, label }: { tone: 'green' | 'red' | 'amber' | 'muted' | 'blue'; label: string }) {
  const color = {
    green: 'bg-sv-green text-sv-green',
    red: 'bg-sv-red text-sv-red',
    amber: 'bg-sv-amber text-sv-amber',
    blue: 'bg-sv-blue text-sv-blue',
    muted: 'bg-muted-foreground text-muted-foreground',
  }[tone]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${color.split(' ')[1]}`}>
      <span className={`relative size-2 rounded-full ${color.split(' ')[0]}`}>
        {tone === 'green' && (
          <span className="absolute inset-0 animate-ping rounded-full bg-sv-green motion-reduce:animate-none" />
        )}
      </span>
      {label}
    </span>
  )
}

function Dashboard() {
  const [keyword, setKeyword] = useState(DEMO_USER.keyword)
  const [keywordDraft, setKeywordDraft] = useState(DEMO_USER.keyword)
  const [contacts, setContacts] = useState<EmergencyContact[]>(demoContacts)
  const [alerts, setAlerts] = useState<AlertEvent[]>(demoAlerts)
  const [pending, setPending] = useState<{ type: AlertEvent['type'] } | null>(null)
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS)
  const geo = useGeolocation()
  const fixRef = useRef<GeoFix | null>(null)
  const pendingRef = useRef(false)

  useEffect(() => {
    fixRef.current = geo.fix
  }, [geo.fix])

  useEffect(() => {
    pendingRef.current = pending !== null
  }, [pending])

  useEffect(() => {
    const saved = localStorage.getItem(KEYWORD_STORAGE)
    if (saved) {
      setKeyword(saved)
      setKeywordDraft(saved)
    }
  }, [])

  const trigger = useCallback((type: AlertEvent['type']) => {
    // Ignore repeat triggers while a countdown is already running.
    if (pendingRef.current) return
    pendingRef.current = true
    setRemaining(COUNTDOWN_SECONDS)
    setPending({ type })
  }, [])

  const onVoice = useCallback(() => trigger('voice'), [trigger])
  const voice = useVoiceKeyword(keyword, onVoice)

  const finish = useCallback(
    (status: AlertEvent['status']) => {
      if (!pending) return
      const fix = fixRef.current
      const event: AlertEvent = {
        id: `a-${crypto.randomUUID().slice(0, 8)}`,
        type: pending.type,
        createdAt: new Date().toISOString(),
        latitude: fix?.latitude,
        longitude: fix?.longitude,
        accuracy: fix?.accuracy,
        status,
        deliveries:
          status === 'sent-demo'
            ? contacts.flatMap((c) =>
                channelsFor(c.channel).map((channel) => ({
                  contactName: c.name,
                  channel,
                  status: 'demo' as const,
                  detail: 'Demo mode — not sent',
                })),
              )
            : [],
      }
      setAlerts((a) => [event, ...a])
      setPending(null)
      if (status === 'sent-demo') {
        toast.warning('Demo alert recorded — nothing was sent', {
          description: 'Real SMS and email delivery switches on once a notification provider is configured.',
        })
      } else {
        toast('Alert cancelled', { description: status === 'false-alarm' ? 'Logged as a false alarm.' : undefined })
      }
    },
    [pending, contacts],
  )

  useEffect(() => {
    if (!pending) return
    if (remaining <= 0) {
      finish('sent-demo')
      return
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [pending, remaining, finish])

  function saveKeyword(e: React.FormEvent) {
    e.preventDefault()
    const n = normalize(keywordDraft)
    if (n.split(' ').length < 2) {
      toast.error('Use at least two words', {
        description: 'Short single words trigger by accident too easily.',
      })
      return
    }
    setKeyword(keywordDraft.trim())
    localStorage.setItem(KEYWORD_STORAGE, keywordDraft.trim())
    toast.success(`Keyword set to “${keywordDraft.trim()}”`)
  }

  const listening = voice.state === 'listening'

  return (
    <div className="sv-backdrop min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back, {DEMO_USER.name}</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Live Safety Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-sv-amber/30 bg-sv-amber/15 text-sv-amber">
              <FlaskConical /> Demo mode
            </Badge>
            <Badge variant="outline" className="border-white/10">
              SMS / email: not configured
            </Badge>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {/* SOS */}
          <Panel
            id="sos"
            title="Emergency SOS"
            icon={ShieldAlert}
            className="lg:row-span-2"
            status={<StatusDot tone="green" label="Ready" />}
          >
            <div className="flex flex-col items-center py-4">
              <div className="relative grid size-52 place-items-center">
                <span className="absolute inset-4 animate-sv-pulse rounded-full bg-sv-red/35 motion-reduce:animate-none" />
                <button
                  type="button"
                  onClick={() => trigger('manual')}
                  className="relative grid size-44 place-items-center rounded-full bg-gradient-to-br from-sv-red to-[oklch(0.5_0.22_15)] font-display text-4xl font-extrabold text-white shadow-2xl shadow-sv-red/40 ring-8 ring-sv-red/15 transition-transform hover:scale-[1.03] focus-visible:ring-sv-red/50 focus-visible:outline-none active:scale-95 motion-reduce:transition-none"
                  aria-describedby="sos-help"
                >
                  SOS
                </button>
              </div>
              <p id="sos-help" className="mt-4 max-w-xs text-center text-sm text-muted-foreground">
                Tap to start a {COUNTDOWN_SECONDS}-second countdown. You can cancel before anything is sent.
              </p>
            </div>
            <div className="mt-4 grid gap-2 rounded-xl bg-black/20 p-4 text-xs">
              <Row label="Voice trigger" value={listening ? `On · “${keyword}”` : 'Off'} ok={listening} />
              <Row
                label="Location"
                value={geo.state === 'sharing' ? `Sharing · ±${Math.round(geo.fix?.accuracy ?? 0)} m` : 'Not shared'}
                ok={geo.state === 'sharing'}
              />
              <Row label="Trusted contacts" value={`${contacts.length} saved`} ok={contacts.length > 0} />
              <Row label="Delivery provider" value="Not configured" ok={false} />
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              In immediate danger, call <strong className="text-foreground">112</strong> or your local emergency number.
            </p>
          </Panel>

          {/* Voice */}
          <Panel
            title="Voice Activation"
            icon={Mic}
            className="lg:col-span-2"
            status={
              listening ? (
                <StatusDot tone="green" label="Listening for keyword" />
              ) : voice.state === 'requesting' ? (
                <StatusDot tone="amber" label="Requesting microphone…" />
              ) : voice.state === 'denied' || voice.state === 'error' ? (
                <StatusDot tone="red" label="Unavailable" />
              ) : (
                <StatusDot tone="muted" label="Off" />
              )
            }
          >
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
              <form onSubmit={saveKeyword} className="grid gap-2">
                <Label htmlFor="keyword">Emergency keyword</Label>
                <div className="flex gap-2">
                  <Input
                    id="keyword"
                    value={keywordDraft}
                    onChange={(e) => setKeywordDraft(e.target.value)}
                    maxLength={40}
                    placeholder="e.g. Help me"
                  />
                  <Button type="submit" variant="secondary" disabled={keywordDraft.trim() === keyword}>
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Matching happens in your browser. SafeVoice never records or uploads what you say.
                </p>
              </form>
              <div className="flex flex-col items-stretch gap-2 md:w-52">
                {listening ? (
                  <Button variant="outline" className="border-white/15" onClick={voice.stop}>
                    <MicOff /> Stop listening
                  </Button>
                ) : (
                  <Button
                    onClick={voice.start}
                    disabled={voice.state === 'unsupported' || voice.state === 'requesting'}
                    className="bg-sv-purple text-white hover:bg-sv-purple/90"
                  >
                    <Mic /> Enable microphone
                  </Button>
                )}
              </div>
            </div>
            <div
              className={`mt-5 flex items-center gap-4 rounded-xl border p-4 transition-colors motion-reduce:transition-none ${
                listening ? 'border-sv-green/30 bg-sv-green/5' : 'border-white/5 bg-black/20'
              }`}
              aria-live="polite"
            >
              <Waveform active={listening} />
              <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {listening
                  ? voice.heard
                    ? <>Hearing: <span className="text-foreground">“{voice.heard}”</span></>
                    : `Say “${keyword}” to test detection.`
                  : voice.state === 'unsupported'
                    ? 'Voice detection isn’t supported in this browser (try Chrome, Edge, or Safari). The SOS button always works.'
                    : 'Voice detection is off.'}
              </p>
            </div>
            {voice.error && (
              <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-sv-red">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {voice.error}
              </p>
            )}
          </Panel>

          {/* Location */}
          <Panel
            title="Live GPS Location"
            icon={MapPin}
            className="lg:col-span-2"
            status={
              geo.state === 'sharing' ? (
                <StatusDot tone="blue" label="Sharing with alerts" />
              ) : geo.state === 'requesting' ? (
                <StatusDot tone="amber" label="Locating…" />
              ) : geo.state === 'off' ? (
                <StatusDot tone="muted" label="Not sharing" />
              ) : (
                <StatusDot tone="red" label="Unavailable" />
              )
            }
          >
            <LocationPanel geo={geo} />
          </Panel>

          {/* Contacts */}
          <Panel title="Emergency Contacts" icon={BellRing} className="lg:col-span-2">
            <ContactsManager contacts={contacts} onChange={setContacts} />
          </Panel>

          {/* History */}
          <Panel title="Alert History" icon={Clock}>
            <AlertHistory alerts={alerts} />
          </Panel>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Want to report something that already happened?{' '}
          <Link to="/report" className="font-medium text-sv-blue hover:underline">
            File a private complaint
          </Link>
        </p>
      </main>
      <SiteFooter />

      <Dialog open={pending !== null} onOpenChange={(o) => !o && finish('cancelled')}>
        <DialogContent className="border-sv-red/40 bg-card sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sv-red">
              <ShieldAlert className="size-5" aria-hidden="true" />
              {pending?.type === 'voice' ? 'Keyword detected' : 'SOS activated'}
            </DialogTitle>
            <DialogDescription>
              Alerting {contacts.length} trusted contact{contacts.length === 1 ? '' : 's'}{' '}
              {geo.fix ? 'with your current location' : 'without location (not shared)'} in…
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-2" aria-live="assertive">
            <span className="font-display text-7xl font-extrabold tabular-nums">{remaining}</span>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-sv-red transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
                style={{ width: `${(remaining / COUNTDOWN_SECONDS) * 100}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-sv-amber">Demo mode — no message will actually be sent.</p>
          </div>
          <DialogFooter className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button variant="outline" className="border-white/15" onClick={() => finish('cancelled')}>
              <X /> Cancel
            </Button>
            <Button variant="outline" className="border-white/15" onClick={() => finish('false-alarm')}>
              False alarm
            </Button>
            <Button className="bg-sv-red text-white hover:bg-sv-red/90" onClick={() => finish('sent-demo')}>
              Send now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`inline-flex items-center gap-1.5 font-medium ${ok ? 'text-foreground' : 'text-muted-foreground'}`}>
        {ok ? (
          <CheckCircle2 className="size-3.5 text-sv-green" aria-hidden="true" />
        ) : (
          <span className="size-1.5 rounded-full bg-muted-foreground/60" />
        )}
        {value}
      </span>
    </div>
  )
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-center gap-1" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, i) => (
        <span
          key={i}
          className={`w-1 rounded-full ${active ? 'animate-pulse bg-sv-green motion-reduce:animate-none' : 'bg-white/15'}`}
          style={{ height: `${[40, 70, 100, 60, 90, 50, 30][i]}%`, animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  )
}

function LocationPanel({ geo }: { geo: ReturnType<typeof useGeolocation> }) {
  const fix = geo.fix
  const d = 0.004
  const mapSrc = fix
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${fix.longitude - d}%2C${fix.latitude - d}%2C${fix.longitude + d}%2C${fix.latitude + d}&layer=mapnik&marker=${fix.latitude}%2C${fix.longitude}`
    : null

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1.3fr]">
      <div className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Latitude" value={fix ? fix.latitude.toFixed(5) : '—'} />
          <Stat label="Longitude" value={fix ? fix.longitude.toFixed(5) : '—'} />
          <Stat
            label="Accuracy"
            value={fix ? `±${Math.round(fix.accuracy)} m` : '—'}
            hint={fix ? (fix.accuracy <= 30 ? 'High' : fix.accuracy <= 150 ? 'Moderate' : 'Low') : undefined}
          />
          <Stat label="Updated" value={fix ? new Date(fix.timestamp).toLocaleTimeString() : '—'} />
        </dl>
        {geo.state === 'sharing' || geo.state === 'requesting' ? (
          <Button variant="outline" className="border-white/15" onClick={geo.stop}>
            <MapPinOff /> Stop sharing location
          </Button>
        ) : (
          <Button onClick={geo.start} className="bg-sv-blue text-white hover:bg-sv-blue/90">
            <Crosshair /> Share my location
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          Your location is only read while sharing is on, is attached only to your own alerts, and is never public.
        </p>
        {geo.error && (
          <p role="alert" className="flex items-start gap-2 text-sm text-sv-red">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {geo.error}
          </p>
        )}
      </div>
      <div className="relative min-h-56 overflow-hidden rounded-xl border border-white/10 bg-black/30">
        {mapSrc ? (
          <iframe
            title="Your current location on a map"
            src={mapSrc}
            className="absolute inset-0 size-full [filter:invert(0.9)_hue-rotate(200deg)_saturate(0.7)]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="sv-grid absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <MapPin className="mx-auto size-8 text-sv-blue/60" aria-hidden="true" />
              <p className="mt-2 text-sm text-muted-foreground">
                The map appears after you choose to share your location.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-black/20 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display font-semibold tabular-nums">
        {value} {hint && <span className="text-xs font-normal text-muted-foreground">· {hint}</span>}
      </dd>
    </div>
  )
}

const deliveryTone: Record<DeliveryStatus, string> = {
  demo: 'border-sv-amber/30 bg-sv-amber/10 text-sv-amber',
  queued: 'border-sv-blue/30 bg-sv-blue/10 text-sv-blue',
  delivered: 'border-sv-green/30 bg-sv-green/10 text-sv-green',
  failed: 'border-sv-red/30 bg-sv-red/10 text-sv-red',
  'not-configured': 'border-white/10 text-muted-foreground',
}

function AlertHistory({ alerts }: { alerts: AlertEvent[] }) {
  if (alerts.length === 0)
    return <p className="text-sm text-muted-foreground">No alerts yet. That’s a good thing.</p>
  return (
    <ol className="grid max-h-[28rem] gap-3 overflow-y-auto pr-1">
      {alerts.map((a) => (
        <li key={a.id} className="rounded-xl bg-black/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{a.type === 'voice' ? 'Voice keyword' : 'Manual SOS'}</span>
            <Badge
              variant="outline"
              className={
                a.status === 'sent-demo'
                  ? 'border-sv-amber/30 text-sv-amber'
                  : 'border-white/10 text-muted-foreground'
              }
            >
              {a.status === 'sent-demo' ? 'Demo alert' : a.status === 'false-alarm' ? 'False alarm' : 'Cancelled'}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground" suppressHydrationWarning>
            {new Date(a.createdAt).toLocaleString()}
            {a.latitude !== undefined && a.longitude !== undefined
              ? ` · ${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)} (±${Math.round(a.accuracy ?? 0)} m)`
              : ' · no location'}
          </p>
          {a.deliveries.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {a.deliveries.map((d, i) => (
                <li key={i}>
                  <span
                    className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] ${deliveryTone[d.status]}`}
                    title={d.detail}
                  >
                    {d.contactName.split(' ')[0]} · {d.channel.toUpperCase()} · {d.detail}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  )
}
