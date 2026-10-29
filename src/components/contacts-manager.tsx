import { useState } from 'react'
import { Mail, MessageSquare, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { z } from 'zod'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ContactChannel, EmergencyContact } from '@/lib/fixtures'

export const MAX_CONTACTS = 5

// E.164-style: optional +, 8–15 digits once spaces, dashes, and brackets are removed.
const phoneSchema = z
  .string()
  .trim()
  .refine((v) => v === '' || /^\+?\d{8,15}$/.test(v.replace(/[\s()-]/g, '')), {
    message: 'Enter a valid phone number with country code, e.g. +91 98765 43210',
  })

export const contactSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter the contact’s name').max(60),
    relationship: z.string().trim().max(40),
    phone: phoneSchema,
    email: z.union([z.literal(''), z.email('Enter a valid email address')]),
    channel: z.enum(['sms', 'email', 'both']),
  })
  .superRefine((v, ctx) => {
    if ((v.channel === 'sms' || v.channel === 'both') && !v.phone)
      ctx.addIssue({ code: 'custom', path: ['phone'], message: 'A phone number is needed for SMS alerts' })
    if ((v.channel === 'email' || v.channel === 'both') && !v.email)
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'An email address is needed for email alerts' })
  })

type Draft = Omit<EmergencyContact, 'id'>
type Errors = Partial<Record<keyof Draft, string>>

const empty: Draft = { name: '', relationship: '', phone: '', email: '', channel: 'both' }

const channelLabel: Record<ContactChannel, string> = {
  sms: 'SMS',
  email: 'Email',
  both: 'SMS + Email',
}

export function ContactsManager({
  contacts,
  onChange,
}: {
  contacts: EmergencyContact[]
  onChange: (next: EmergencyContact[]) => void
}) {
  const [editing, setEditing] = useState<EmergencyContact | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(empty)
  const [errors, setErrors] = useState<Errors>({})

  function open(target: EmergencyContact | 'new') {
    setEditing(target)
    setErrors({})
    setDraft(target === 'new' ? empty : { ...target })
  }

  function save(e: React.FormEvent) {
    e.preventDefault()
    const parsed = contactSchema.safeParse(draft)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Draft
        next[key] ??= issue.message
      }
      setErrors(next)
      return
    }
    if (editing === 'new') {
      onChange([...contacts, { ...parsed.data, id: crypto.randomUUID() }])
    } else if (editing) {
      onChange(contacts.map((c) => (c.id === editing.id ? { ...parsed.data, id: c.id } : c)))
    }
    setEditing(null)
  }

  const field = (key: keyof Draft) => ({
    id: `contact-${key}`,
    value: draft[key],
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `contact-${key}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setDraft((d) => ({ ...d, [key]: e.target.value })),
  })

  const err = (key: keyof Draft) =>
    errors[key] ? (
      <p id={`contact-${key}-error`} className="text-xs text-sv-red">
        {errors[key]}
      </p>
    ) : null

  return (
    <>
      {contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-6 text-center">
          <Users className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium">No trusted contacts yet</p>
          <p className="text-xs text-muted-foreground">
            Add at least one person so your alert has somewhere to go.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {contacts.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sv-blue/40 to-sv-purple/40 font-display text-sm font-semibold">
                {c.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {c.name}{' '}
                  <span className="text-muted-foreground">· {c.relationship || 'Contact'}</span>
                </p>
                <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                  {c.phone && (
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="size-3" aria-hidden="true" />
                      {c.phone}
                    </span>
                  )}
                  {c.email && (
                    <span className="inline-flex min-w-0 items-center gap-1 truncate">
                      <Mail className="size-3" aria-hidden="true" />
                      {c.email}
                    </span>
                  )}
                </p>
              </div>
              <Badge variant="outline" className="hidden border-white/10 sm:inline-flex">
                {channelLabel[c.channel]}
              </Badge>
              <Button variant="ghost" size="icon" aria-label={`Edit ${c.name}`} onClick={() => open(c)}>
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${c.name}`}
                className="text-muted-foreground hover:text-sv-red"
                onClick={() => onChange(contacts.filter((x) => x.id !== c.id))}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button
        variant="outline"
        className="mt-4 w-full border-white/10 bg-white/5"
        disabled={contacts.length >= MAX_CONTACTS}
        onClick={() => open('new')}
      >
        <Plus /> {contacts.length >= MAX_CONTACTS ? `Limit of ${MAX_CONTACTS} reached` : 'Add trusted contact'}
      </Button>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{editing === 'new' ? 'Add trusted contact' : 'Edit contact'}</DialogTitle>
            <DialogDescription>
              They’ll receive your alert type, time, and — if you share it — your location.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-4" noValidate>
            <div className="grid gap-1.5">
              <Label htmlFor="contact-name">Name</Label>
              <Input {...field('name')} autoComplete="name" />
              {err('name')}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contact-relationship">Relationship (optional)</Label>
              <Input {...field('relationship')} placeholder="Sister, friend, roommate…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input {...field('phone')} type="tel" inputMode="tel" placeholder="+91 98765 43210" />
                {err('phone')}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="contact-email">Email</Label>
                <Input {...field('email')} type="email" placeholder="name@example.com" />
                {err('email')}
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contact-channel">Alert by</Label>
              <Select
                value={draft.channel}
                onValueChange={(v) => setDraft((d) => ({ ...d, channel: v as ContactChannel }))}
              >
                <SelectTrigger id="contact-channel" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">SMS + Email</SelectItem>
                  <SelectItem value="sms">SMS only</SelectItem>
                  <SelectItem value="email">Email only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save contact</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
