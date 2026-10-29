import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BellRing,
  BookOpen,
  FileWarning,
  Lock,
  MapPin,
  Mic,
  Radio,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'

export const Route = createFileRoute('/')({
  component: Home,
})

const features = [
  {
    icon: Mic,
    title: 'Voice Activation',
    body: 'Choose a private keyword like “Help Me.” SafeVoice listens only while you switch it on and matches the phrase in your browser — nothing is recorded.',
    accent: 'text-sv-purple bg-sv-purple/15',
  },
  {
    icon: MapPin,
    title: 'Live GPS',
    body: 'With your permission, attach precise coordinates, accuracy, and a timestamp to every alert. Stop sharing with one tap.',
    accent: 'text-sv-blue bg-sv-blue/15',
  },
  {
    icon: Users,
    title: 'Emergency Contacts',
    body: 'Keep a short list of trusted people who receive your alert by SMS or email, each with validated contact details.',
    accent: 'text-sv-green bg-sv-green/15',
  },
  {
    icon: Radio,
    title: 'Real-Time Response',
    body: 'Authorized responders see active alerts on a live map and can acknowledge, assign, and resolve them.',
    accent: 'text-sv-red bg-sv-red/15',
  },
  {
    icon: FileWarning,
    title: 'Crime Complaints',
    body: 'Report harassment, stalking, threats, or suspicious activity privately, attach evidence, and track progress by reference number.',
    accent: 'text-sv-amber bg-sv-amber/15',
  },
  {
    icon: Lock,
    title: 'Privacy',
    body: 'No continuous recording, no silent tracking. Your records are visible only to you and authorized reviewers.',
    accent: 'text-sv-purple bg-sv-purple/15',
  },
]

const steps = [
  {
    n: '01',
    title: 'Set your keyword',
    body: 'Pick a phrase you can say naturally under stress. Test it right in the dashboard.',
  },
  {
    n: '02',
    title: 'Add trusted contacts',
    body: 'Add up to five people. Numbers and emails are validated before they are saved.',
  },
  {
    n: '03',
    title: 'Speak or tap SOS',
    body: 'A short countdown lets you cancel false alarms before your alert and location go out.',
  },
]

function Home() {
  return (
    <div className="sv-backdrop min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="sv-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="relative mx-auto grid max-w-content items-center gap-14 px-4 pt-16 pb-20 sm:px-6 md:pt-24 lg:grid-cols-[1.15fr_1fr]">
            <div className="animate-sv-rise motion-reduce:animate-none">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="size-1.5 rounded-full bg-sv-green" />
                Hidden crime reporting &amp; women safety
              </p>
              <h1 className="mt-6 font-display text-5xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Your Voice Is the{' '}
                <span className="sv-gradient-text">Panic Button.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
                SafeVoice turns a private spoken keyword into an emergency
                alert — with your live location — for the people you trust.
                When it is safe to speak up, report harassment, stalking, or
                threats discreetly and follow every step of the review.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  asChild
                  size="lg"
                  className="h-12 bg-gradient-to-r from-sv-purple to-sv-red px-6 text-base text-white shadow-lg shadow-sv-red/25 hover:opacity-95"
                >
                  <Link to="/dashboard">
                    <ShieldCheck /> Get Protected Now
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/15 bg-white/5 px-6 text-base"
                >
                  <Link to="/guide">
                    <BookOpen /> Setup Guide
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-12 px-6 text-base text-sv-blue hover:text-sv-blue"
                >
                  <Link to="/dashboard">
                    Open Live Dashboard <ArrowRight />
                  </Link>
                </Button>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                In immediate danger? Call your local emergency number first.
              </p>
            </div>

            <HeroVisual />
          </div>
        </section>

        <section
          aria-labelledby="features"
          className="mx-auto max-w-content px-4 py-20 sm:px-6"
        >
          <div className="max-w-2xl">
            <h2
              id="features"
              className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Protection that stays out of sight
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every feature is designed to work quietly, under stress, and
              only with your consent.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <article
                key={f.title}
                style={{ animationDelay: `${i * 70}ms` }}
                className="group sv-glass animate-sv-rise rounded-2xl p-6 transition-transform hover:-translate-y-1 motion-reduce:animate-none motion-reduce:transition-none"
              >
                <span
                  className={`grid size-11 place-items-center rounded-xl ${f.accent}`}
                >
                  <f.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/5 bg-black/15">
          <div className="mx-auto grid max-w-content gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Ready in three minutes
              </h2>
              <p className="mt-3 text-muted-foreground">
                Set up once, then forget it is there until you need it.
              </p>
              <Button asChild className="mt-8" size="lg">
                <Link to="/guide">
                  Read the setup guide <ArrowRight />
                </Link>
              </Button>
            </div>
            <ol className="grid gap-4">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className="sv-glass flex gap-5 rounded-2xl p-5"
                >
                  <span className="font-display text-2xl font-bold text-sv-purple">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-display font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-content px-4 py-20 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-sv-purple/25 via-sv-blue/10 to-sv-red/20 p-8 sm:p-12">
            <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight">
                  Honest about what is live
                </h2>
                <p className="mt-3 text-muted-foreground">
                  This build runs in a clearly labeled demo mode. Voice
                  detection and GPS work in your browser today; SMS and email
                  delivery, accounts, and the responder console switch on once
                  their services are configured. SafeVoice is not connected to
                  police services.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Button asChild size="lg" className="bg-sv-red text-white hover:bg-sv-red/90">
                  <Link to="/dashboard">Try the SOS demo</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/15 bg-white/5">
                  <Link to="/report">File a private report</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function HeroVisual() {
  return (
    <div
      className="relative mx-auto w-full max-w-sm animate-sv-rise [animation-delay:150ms] motion-reduce:animate-none"
      aria-hidden="true"
    >
      <div className="absolute -inset-10 rounded-full bg-sv-purple/20 blur-3xl" />
      <div className="relative rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-[oklch(0.22_0.05_272)] to-[oklch(0.17_0.04_272)] p-5 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>SafeVoice</span>
          <span className="inline-flex items-center gap-1.5 text-sv-green">
            <span className="size-1.5 rounded-full bg-sv-green" /> Listening
          </span>
        </div>
        <div className="relative mx-auto my-10 grid size-44 place-items-center">
          <span className="absolute inset-0 animate-sv-pulse rounded-full bg-sv-red/40 motion-reduce:animate-none" />
          <span className="absolute inset-0 animate-sv-pulse rounded-full bg-sv-purple/30 [animation-delay:1.2s] motion-reduce:animate-none" />
          <span className="relative grid size-32 place-items-center rounded-full bg-gradient-to-br from-sv-red to-sv-purple shadow-xl shadow-sv-red/40">
            <Mic className="size-12 text-white" />
          </span>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Say <span className="font-semibold text-foreground">“Help me”</span>{' '}
          to alert your circle
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-white/5 p-3">
            <MapPin className="mb-2 size-4 text-sv-blue" />
            <p className="font-medium text-foreground">12.9716° N</p>
            <p className="text-muted-foreground">±18 m accuracy</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <BellRing className="mb-2 size-4 text-sv-amber" />
            <p className="font-medium text-foreground">3 contacts</p>
            <p className="text-muted-foreground">SMS + email</p>
          </div>
        </div>
      </div>
    </div>
  )
}
