// Demo-mode fixtures. Every value here is fictional and nothing in this file is
// ever sent to a real person or service. Later milestones replace these with
// per-user records from the database (see PLAN.md).

export type ContactChannel = 'sms' | 'email' | 'both'

export type EmergencyContact = {
  id: string
  name: string
  relationship: string
  phone: string
  email: string
  channel: ContactChannel
}

export type DeliveryStatus =
  | 'demo'
  | 'queued'
  | 'delivered'
  | 'failed'
  | 'not-configured'

export type AlertEvent = {
  id: string
  type: 'voice' | 'manual'
  createdAt: string
  latitude?: number
  longitude?: number
  accuracy?: number
  status: 'cancelled' | 'false-alarm' | 'sent-demo'
  deliveries: { contactName: string; channel: 'sms' | 'email'; status: DeliveryStatus; detail: string }[]
}

export type ComplaintCategory =
  | 'harassment'
  | 'stalking'
  | 'threats'
  | 'suspicious-activity'
  | 'other'

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved'

export type Complaint = {
  reference: string
  category: ComplaintCategory
  incidentDate: string
  incidentTime: string
  location: string
  description: string
  evidence: string[]
  status: ComplaintStatus
  submittedAt: string
  updates: { at: string; status: ComplaintStatus; note: string }[]
}

export const DEMO_USER = {
  name: 'Ananya (demo)',
  keyword: 'help me',
}

export const demoContacts: EmergencyContact[] = [
  {
    id: 'c1',
    name: 'Priya Sharma',
    relationship: 'Sister',
    phone: '+91 98765 43210',
    email: 'priya.demo@example.com',
    channel: 'both',
  },
  {
    id: 'c2',
    name: 'Rahul Menon',
    relationship: 'Friend',
    phone: '+91 91234 56780',
    email: 'rahul.demo@example.com',
    channel: 'sms',
  },
  {
    id: 'c3',
    name: 'Meera Iyer',
    relationship: 'Roommate',
    phone: '',
    email: 'meera.demo@example.com',
    channel: 'email',
  },
]

export const demoAlerts: AlertEvent[] = [
  {
    id: 'a-2041',
    type: 'manual',
    createdAt: '2026-10-24T21:42:00+05:30',
    latitude: 12.9716,
    longitude: 77.5946,
    accuracy: 18,
    status: 'false-alarm',
    deliveries: [],
  },
  {
    id: 'a-2033',
    type: 'voice',
    createdAt: '2026-10-19T19:05:00+05:30',
    latitude: 12.9352,
    longitude: 77.6245,
    accuracy: 32,
    status: 'sent-demo',
    deliveries: [
      { contactName: 'Priya Sharma', channel: 'sms', status: 'demo', detail: 'Demo mode — not sent' },
      { contactName: 'Priya Sharma', channel: 'email', status: 'demo', detail: 'Demo mode — not sent' },
      { contactName: 'Rahul Menon', channel: 'sms', status: 'demo', detail: 'Demo mode — not sent' },
    ],
  },
]

export const categoryLabels: Record<ComplaintCategory, string> = {
  harassment: 'Harassment',
  stalking: 'Stalking',
  threats: 'Threats',
  'suspicious-activity': 'Suspicious activity',
  other: 'Other',
}

export const complaintStatuses: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
]

export const demoComplaints: Complaint[] = [
  {
    reference: 'SV-2026-4F7K2Q',
    category: 'stalking',
    incidentDate: '2026-10-12',
    incidentTime: '20:15',
    location: 'Bus stop near MG Road metro, Bengaluru',
    description:
      'The same person has followed me from the metro exit to my bus stop on three evenings this week and stands close while I wait.',
    evidence: ['bus-stop-photo.jpg'],
    status: 'In Progress',
    submittedAt: '2026-10-13T09:20:00+05:30',
    updates: [
      { at: '2026-10-13T09:20:00+05:30', status: 'Submitted', note: 'Complaint received.' },
      { at: '2026-10-14T11:02:00+05:30', status: 'Under Review', note: 'Assigned to a SafeVoice reviewer.' },
      { at: '2026-10-16T16:40:00+05:30', status: 'In Progress', note: 'Reviewer shared local helpline and reporting options.' },
    ],
  },
  {
    reference: 'SV-2026-9B3XMA',
    category: 'harassment',
    incidentDate: '2026-09-28',
    incidentTime: '13:30',
    location: 'Online — messaging app',
    description: 'Repeated abusive messages from an unknown account after I declined a request.',
    evidence: ['screenshot-1.png', 'screenshot-2.png'],
    status: 'Resolved',
    submittedAt: '2026-09-28T18:10:00+05:30',
    updates: [
      { at: '2026-09-28T18:10:00+05:30', status: 'Submitted', note: 'Complaint received.' },
      { at: '2026-09-29T10:00:00+05:30', status: 'Under Review', note: 'Evidence reviewed.' },
      { at: '2026-10-02T15:30:00+05:30', status: 'Resolved', note: 'Account reported to the platform; guidance shared.' },
    ],
  },
]

export function makeReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `SV-${new Date().getFullYear()}-${out}`
}
