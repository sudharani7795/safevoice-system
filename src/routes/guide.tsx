import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, BellRing, FileWarning, MapPin, Mic, ShieldCheck, Smartphone } from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'

export const Route = createFileRoute('/guide')({
  head: () => ({ meta: [{ title: 'Setup Guide · SafeVoice' }] }),
  component: Guide,
})

const steps = [
  {
    icon: Smartphone,
    title: 'Open SafeVoice on your phone',
    body: 'Use Chrome, Edge, or Safari. Add it to your home screen from the browser menu so it is one tap away.',
  },
  {
    icon: Mic,
    title: 'Choose your keyword and allow the microphone',
    body: 'On the Live Dashboard, set a two-to-four word phrase you would say naturally, like “Help me” or “Call my sister.” Tap Enable microphone and accept the browser prompt. Say the phrase once to confirm it is detected.',
  },
  {
    icon: MapPin,
    title: 'Allow location while you want it shared',
    body: 'Tap Share my location and accept the prompt. Latitude, longitude, and accuracy appear with a map. Tap Stop sharing any time — nothing is read in the background.',
  },
  {
    icon: BellRing,
    title: 'Add trusted contacts',
    body: 'Add up to five people with a valid phone number (with country code) and/or email. Tell them they may receive SafeVoice alerts.',
  },
  {
    icon: ShieldCheck,
    title: 'Practice the SOS flow',
    body: 'Tap SOS or say your keyword. A 10-second countdown starts — practice cancelling and marking a false alarm so it is familiar.',
  },
  {
    icon: FileWarning,
    title: 'Report incidents when it is safe',
    body: 'Use Report a Crime to describe what happened, attach evidence, and get a reference number you can track.',
  },
]

const faqs = [
  {
    q: 'Does SafeVoice record my conversations?',
    a: 'No. While voice activation is on, your browser’s speech recognizer turns speech into text which SafeVoice compares to your keyword in memory and immediately discards. Nothing is recorded or uploaded by SafeVoice. Note that some browsers (such as Chrome) process speech recognition on their own servers.',
  },
  {
    q: 'Why isn’t voice detection available on my device?',
    a: 'Voice detection depends on the Web Speech API, which some browsers (for example Firefox) do not support. The SOS button works everywhere.',
  },
  {
    q: 'Will SafeVoice contact the police?',
    a: 'No. SafeVoice is not integrated with any police service. In immediate danger, call your local emergency number (112 in India and the EU, 911 in the US).',
  },
  {
    q: 'Are alerts really sent right now?',
    a: 'Not yet. This build runs in demo mode: alerts, deliveries, and complaints are simulated and never leave your browser. Real SMS and email delivery will be enabled only after a notification provider is configured and tested.',
  },
  {
    q: 'Does voice detection work with the screen locked?',
    a: 'Browsers pause microphone access when the tab is in the background or the screen is locked. Keep SafeVoice open in the foreground when you need voice activation.',
  },
]

function Guide() {
  return (
    <div className="sv-backdrop min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-content px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">Setup Guide</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Six short steps to get SafeVoice ready before you ever need it.
          </p>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.title} className="sv-glass flex gap-4 rounded-2xl p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sv-purple/30 to-sv-blue/30">
                <s.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold text-sv-purple">Step {i + 1}</p>
                <h2 className="font-display font-semibold">{s.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Button asChild size="lg" className="bg-gradient-to-r from-sv-purple to-sv-red text-white">
            <Link to="/dashboard">
              Start setup on the dashboard <ArrowRight />
            </Link>
          </Button>
        </div>

        <section className="mt-16 max-w-3xl" aria-labelledby="faq">
          <h2 id="faq" className="font-display text-2xl font-bold">
            Questions
          </h2>
          <Accordion type="single" collapsible className="mt-4">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-white/10">
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
