import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileText,
  FlaskConical,
  Lock,
  Paperclip,
  Search,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import {
  categoryLabels,
  complaintStatuses,
  demoComplaints,
  makeReference,
  type Complaint,
  type ComplaintCategory,
  type ComplaintStatus,
} from '@/lib/fixtures'

export const Route = createFileRoute('/report')({
  head: () => ({ meta: [{ title: 'Report a Crime · SafeVoice' }] }),
  component: ReportPage,
})

const MAX_FILES = 5
const MAX_FILE_MB = 10
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'audio/mpeg', 'audio/mp4', 'video/mp4']

const complaintSchema = z.object({
  category: z.enum(['harassment', 'stalking', 'threats', 'suspicious-activity', 'other'], {
    message: 'Choose a category',
  }),
  incidentDate: z
    .string()
    .min(1, 'Enter the date')
    .refine((d) => new Date(d) <= new Date(), 'The date can’t be in the future'),
  incidentTime: z.string().min(1, 'Enter the approximate time'),
  location: z.string().trim().min(3, 'Describe where it happened').max(200),
  description: z
    .string()
    .trim()
    .min(30, 'Please describe what happened in at least 30 characters')
    .max(5000),
})

type FormState = {
  category: ComplaintCategory | ''
  incidentDate: string
  incidentTime: string
  location: string
  description: string
}
type Errors = Partial<Record<keyof FormState, string>>

const blank: FormState = { category: '', incidentDate: '', incidentTime: '', location: '', description: '' }

const statusTone: Record<ComplaintStatus, string> = {
  Submitted: 'border-sv-blue/30 bg-sv-blue/10 text-sv-blue',
  'Under Review': 'border-sv-purple/30 bg-sv-purple/10 text-sv-purple',
  'In Progress': 'border-sv-amber/30 bg-sv-amber/10 text-sv-amber',
  Resolved: 'border-sv-green/30 bg-sv-green/10 text-sv-green',
}

function ReportPage() {
  const [tab, setTab] = useState('new')
  const [complaints, setComplaints] = useState<Complaint[]>(demoComplaints)
  const [form, setForm] = useState<FormState>(blank)
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<Complaint | null>(null)

  function addFiles(list: FileList | null) {
    if (!list) return
    const next = [...files]
    for (const f of Array.from(list)) {
      if (!ACCEPTED.includes(f.type)) {
        toast.error(`${f.name} isn’t a supported file type`)
        continue
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${f.name} is larger than ${MAX_FILE_MB} MB`)
        continue
      }
      if (next.length >= MAX_FILES) {
        toast.error(`You can attach up to ${MAX_FILES} files`)
        break
      }
      next.push(f)
    }
    setFiles(next)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = complaintSchema.safeParse(form)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof FormState] ??= issue.message
      setErrors(next)
      return
    }
    setErrors({})
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 700))
    const now = new Date().toISOString()
    const complaint: Complaint = {
      ...parsed.data,
      reference: makeReference(),
      evidence: files.map((f) => f.name),
      status: 'Submitted',
      submittedAt: now,
      updates: [{ at: now, status: 'Submitted', note: 'Complaint received (demo — stored in this browser only).' }],
    }
    setComplaints((c) => [complaint, ...c])
    setSubmitted(complaint)
    setForm(blank)
    setFiles([])
    setSubmitting(false)
  }

  const bind = (key: Exclude<keyof FormState, 'category'>) => ({
    id: `c-${key}`,
    value: form[key],
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `c-${key}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  })
  const err = (key: keyof FormState) =>
    errors[key] ? (
      <p id={`c-${key}-error`} className="text-xs text-sv-red">
        {errors[key]}
      </p>
    ) : null

  return (
    <div className="sv-backdrop min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-10">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Report a Crime</h1>
          <p className="mt-2 text-muted-foreground">
            Your report is private. Only you and authorized SafeVoice reviewers can see it. SafeVoice is not
            connected to the police — reviewers can share local reporting options with you.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-8">
          <TabsList>
            <TabsTrigger value="new">New complaint</TabsTrigger>
            <TabsTrigger value="history">My complaints ({complaints.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-6">
            {submitted ? (
              <div className="sv-glass mx-auto max-w-xl rounded-2xl p-8 text-center">
                <CheckCircle2 className="mx-auto size-12 text-sv-green" aria-hidden="true" />
                <h2 className="mt-4 font-display text-2xl font-bold">Complaint submitted</h2>
                <p className="mt-2 text-sm text-muted-foreground">Keep this reference number to track progress.</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(submitted.reference)
                    toast.success('Reference copied')
                  }}
                  className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-5 py-3 font-mono text-lg tracking-wider hover:bg-black/40"
                >
                  {submitted.reference} <Copy className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className="sr-only">Copy reference</span>
                </button>
                <p className="mt-4 text-xs text-sv-amber">
                  Demo mode — this complaint is kept only in this browser tab.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                  <Button onClick={() => setTab('history')}>Track my complaints</Button>
                  <Button variant="outline" className="border-white/15" onClick={() => setSubmitted(null)}>
                    File another
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <form onSubmit={submit} noValidate className="sv-glass grid gap-5 rounded-2xl p-5 sm:p-7">
                  <div className="grid gap-1.5">
                    <Label htmlFor="c-category">Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm((f) => ({ ...f, category: v as ComplaintCategory }))}
                    >
                      <SelectTrigger
                        id="c-category"
                        className="w-full"
                        aria-invalid={errors.category ? true : undefined}
                      >
                        <SelectValue placeholder="What kind of incident?" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {err('category')}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-incidentDate">Incident date</Label>
                      <Input type="date" {...bind('incidentDate')} />
                      {err('incidentDate')}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="c-incidentTime">Approximate time</Label>
                      <Input type="time" {...bind('incidentTime')} />
                      {err('incidentTime')}
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="c-location">Location</Label>
                    <Input placeholder="Street, landmark, or “Online — app name”" {...bind('location')} />
                    {err('location')}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="c-description">What happened?</Label>
                    <Textarea
                      rows={6}
                      placeholder="Describe the incident in your own words: who was involved, what was said or done, and anything that could help."
                      {...bind('description')}
                    />
                    <div className="flex justify-between gap-2">
                      {err('description') ?? <span />}
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {form.description.length}/5000
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <span className="text-sm font-medium">Supporting evidence (optional)</span>
                    <label
                      htmlFor="c-evidence"
                      className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 bg-black/20 p-6 text-center hover:border-sv-purple/50 focus-within:border-ring"
                    >
                      <Upload className="size-6 text-muted-foreground" aria-hidden="true" />
                      <span className="text-sm">Add photos, screenshots, audio, video, or PDFs</span>
                      <span className="text-xs text-muted-foreground">
                        Up to {MAX_FILES} files, {MAX_FILE_MB} MB each
                      </span>
                      <input
                        id="c-evidence"
                        type="file"
                        multiple
                        accept={ACCEPTED.join(',')}
                        className="sr-only"
                        onChange={(e) => {
                          addFiles(e.target.files)
                          e.target.value = ''
                        }}
                      />
                    </label>
                    {files.length > 0 && (
                      <ul className="grid gap-1.5">
                        {files.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-sm">
                            <Paperclip className="size-4 text-muted-foreground" aria-hidden="true" />
                            <span className="min-w-0 flex-1 truncate">{f.name}</span>
                            <span className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              aria-label={`Remove ${f.name}`}
                              onClick={() => setFiles(files.filter((_, j) => j !== i))}
                            >
                              <X />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Button type="submit" size="lg" disabled={submitting} className="bg-gradient-to-r from-sv-purple to-sv-blue text-white">
                    {submitting ? 'Submitting…' : 'Submit complaint'}
                  </Button>
                </form>

                <aside className="grid content-start gap-4">
                  <div className="sv-glass rounded-2xl p-5">
                    <h2 className="flex items-center gap-2 font-display font-semibold">
                      <Lock className="size-4 text-sv-green" aria-hidden="true" /> Your privacy
                    </h2>
                    <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                      <li>Reports are linked only to your account.</li>
                      <li>Evidence files are stored privately and never made public.</li>
                      <li>Every reviewer action is recorded in an audit log.</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-sv-amber/30 bg-sv-amber/10 p-5 text-sm text-sv-amber">
                    <p className="flex items-center gap-2 font-semibold">
                      <FlaskConical className="size-4" aria-hidden="true" /> Demo mode
                    </p>
                    <p className="mt-1 text-sv-amber/90">
                      Complaints and files stay in this browser and are not reviewed by anyone yet.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-sv-red/30 bg-sv-red/10 p-5 text-sm">
                    <p className="flex items-center gap-2 font-semibold text-sv-red">
                      <AlertTriangle className="size-4" aria-hidden="true" /> In danger right now?
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Call 112 or your local emergency number. Women helpline (India): 181.
                    </p>
                  </div>
                </aside>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <ComplaintHistory complaints={complaints} />
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  )
}

function ComplaintHistory({ complaints }: { complaints: Complaint[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ComplaintStatus | 'all'>('all')
  const [openRef, setOpenRef] = useState<string | null>(complaints[0]?.reference ?? null)

  const filtered = useMemo(
    () =>
      complaints.filter(
        (c) =>
          (status === 'all' || c.status === status) &&
          (query === '' ||
            c.reference.toLowerCase().includes(query.toLowerCase()) ||
            c.location.toLowerCase().includes(query.toLowerCase())),
      ),
    [complaints, query, status],
  )

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Search by reference or location"
            placeholder="Search by reference or location"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as ComplaintStatus | 'all')}>
          <SelectTrigger className="sm:w-48" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {complaintStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="sv-glass rounded-2xl p-10 text-center">
          <FileText className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-2 font-medium">No complaints match</p>
          <p className="text-sm text-muted-foreground">Try a different search or status filter.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {filtered.map((c) => {
            const isOpen = openRef === c.reference
            const step = complaintStatuses.indexOf(c.status)
            return (
              <li key={c.reference} className="sv-glass rounded-2xl">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenRef(isOpen ? null : c.reference)}
                  className="flex w-full flex-col gap-2 rounded-2xl p-5 text-left sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm tracking-wide">{c.reference}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {categoryLabels[c.category]} · {c.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.submittedAt).toLocaleDateString()}
                    </span>
                    <Badge variant="outline" className={statusTone[c.status]}>
                      {c.status}
                    </Badge>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-white/5 p-5">
                    <ol className="grid grid-cols-4 gap-2" aria-label="Progress">
                      {complaintStatuses.map((s, i) => (
                        <li key={s} className="grid gap-1.5">
                          <span className={`h-1.5 rounded-full ${i <= step ? 'bg-gradient-to-r from-sv-purple to-sv-blue' : 'bg-white/10'}`} />
                          <span className={`text-[11px] sm:text-xs ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {s}
                          </span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <div>
                        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Details</h3>
                        <p className="mt-2 text-sm">
                          {new Date(`${c.incidentDate}T${c.incidentTime}`).toLocaleString()}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
                        {c.evidence.length > 0 && (
                          <p className="mt-3 flex flex-wrap gap-1.5">
                            {c.evidence.map((e) => (
                              <span key={e} className="inline-flex items-center gap-1 rounded-md bg-black/25 px-2 py-1 text-xs">
                                <Paperclip className="size-3" aria-hidden="true" /> {e}
                              </span>
                            ))}
                          </p>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Updates</h3>
                        <ol className="mt-2 grid gap-3 border-l border-white/10 pl-4">
                          {[...c.updates].reverse().map((u, i) => (
                            <li key={i} className="relative text-sm">
                              <span className="absolute top-1.5 -left-[1.3rem] size-2 rounded-full bg-sv-purple" />
                              <p className="font-medium">{u.status}</p>
                              <p className="text-muted-foreground">{u.note}</p>
                              <p className="text-xs text-muted-foreground">{new Date(u.at).toLocaleString()}</p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
