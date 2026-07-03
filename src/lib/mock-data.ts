export interface Shift {
  id: string
  ward: string
  department: string
  date: string
  dateISO: string
  time: string
  duration: string
  type: 'Day' | 'Late' | 'Night'
  rate: string
  spots: number
  notes: string
  address: string
}

export interface Application {
  id: string
  shiftId: string
  ward: string
  date: string
  time: string
  type: 'Day' | 'Late' | 'Night'
  rate: string
  appliedOn: string
  status: 'pending' | 'approved' | 'rejected'
}

export const ALL_SHIFTS: Shift[] = [
  {
    id: 's1', ward: 'A&E', department: 'Emergency Department',
    date: 'Thu 26 Jun', dateISO: '2026-06-26', time: '07:00 – 15:00',
    duration: '8 hrs', type: 'Day', rate: '£22/hr', spots: 2,
    notes: 'Experience in triage preferred. PPE provided on-site.',
    address: 'Royal London Hospital, Whitechapel Rd, London E1 1FR',
  },
  {
    id: 's2', ward: 'ICU', department: 'Intensive Care Unit',
    date: 'Thu 26 Jun', dateISO: '2026-06-26', time: '15:00 – 23:00',
    duration: '8 hrs', type: 'Late', rate: '£24/hr', spots: 1,
    notes: 'Level 3 ICU experience required. Ventilator competency essential.',
    address: 'Royal London Hospital, Whitechapel Rd, London E1 1FR',
  },
  {
    id: 's3', ward: 'Cardiology', department: 'Cardiology Ward 7B',
    date: 'Fri 27 Jun', dateISO: '2026-06-27', time: '07:00 – 15:00',
    duration: '8 hrs', type: 'Day', rate: '£22/hr', spots: 3,
    notes: 'Cardiac monitoring experience preferred.',
    address: 'Royal London Hospital, Whitechapel Rd, London E1 1FR',
  },
  {
    id: 's4', ward: 'Maternity', department: 'Maternity & Obstetrics',
    date: 'Sat 28 Jun', dateISO: '2026-06-28', time: '07:00 – 15:00',
    duration: '8 hrs', type: 'Day', rate: '£22/hr', spots: 1,
    notes: 'Midwifery experience advantageous but not essential for support roles.',
    address: 'Royal London Hospital, Whitechapel Rd, London E1 1FR',
  },
  {
    id: 's5', ward: 'A&E', department: 'Emergency Department',
    date: 'Sat 28 Jun', dateISO: '2026-06-28', time: '19:00 – 07:00',
    duration: '12 hrs', type: 'Night', rate: '£27/hr', spots: 2,
    notes: 'Night premium rate applies. Breakfast provided.',
    address: 'Royal London Hospital, Whitechapel Rd, London E1 1FR',
  },
  {
    id: 's6', ward: 'Oncology', department: 'Cancer Care Unit',
    date: 'Sun 29 Jun', dateISO: '2026-06-29', time: '07:00 – 15:00',
    duration: '8 hrs', type: 'Day', rate: '£22/hr', spots: 2,
    notes: 'Palliative care awareness essential. Supportive team environment.',
    address: 'Royal London Hospital, Whitechapel Rd, London E1 1FR',
  },
  {
    id: 's7', ward: 'Surgical', department: 'General Surgery',
    date: 'Mon 30 Jun', dateISO: '2026-06-30', time: '07:00 – 15:00',
    duration: '8 hrs', type: 'Day', rate: '£22/hr', spots: 2,
    notes: 'Pre and post-operative care experience preferred.',
    address: 'Royal London Hospital, Whitechapel Rd, London E1 1FR',
  },
  {
    id: 's8', ward: 'Paediatrics', department: 'Children\'s Ward',
    date: 'Mon 30 Jun', dateISO: '2026-06-30', time: '15:00 – 23:00',
    duration: '8 hrs', type: 'Late', rate: '£23/hr', spots: 1,
    notes: 'Enhanced DBS required. Experience with children aged 0–16.',
    address: 'Royal London Hospital, Whitechapel Rd, London E1 1FR',
  },
]

export const MY_APPLICATIONS: Application[] = [
  {
    id: 'a1', shiftId: 's3', ward: 'Cardiology',
    date: 'Fri 27 Jun', time: '07:00 – 15:00', type: 'Day',
    rate: '£22/hr', appliedOn: '18 Jun 2026', status: 'approved',
  },
  {
    id: 'a2', shiftId: 's2', ward: 'ICU',
    date: 'Thu 26 Jun', time: '15:00 – 23:00', type: 'Late',
    rate: '£24/hr', appliedOn: '19 Jun 2026', status: 'pending',
  },
  {
    id: 'a3', shiftId: 's5', ward: 'A&E Night',
    date: 'Sat 28 Jun', time: '19:00 – 07:00', type: 'Night',
    rate: '£27/hr', appliedOn: '20 Jun 2026', status: 'pending',
  },
  {
    id: 'a4', shiftId: 's6', ward: 'Oncology',
    date: 'Sun 29 Jun', time: '07:00 – 15:00', type: 'Day',
    rate: '£22/hr', appliedOn: '15 Jun 2026', status: 'rejected',
  },
]

export const MY_SCHEDULE: Shift[] = [
  {
    id: 'sc1', ward: 'A&E', department: 'Emergency Department',
    date: 'Wed 25 Jun', dateISO: '2026-06-25', time: '07:00 – 15:00',
    duration: '8 hrs', type: 'Day', rate: '£22/hr', spots: 0,
    notes: '', address: 'Royal London Hospital',
  },
  {
    id: 'sc2', ward: 'Cardiology', department: 'Cardiology Ward 7B',
    date: 'Fri 27 Jun', dateISO: '2026-06-27', time: '07:00 – 15:00',
    duration: '8 hrs', type: 'Day', rate: '£22/hr', spots: 0,
    notes: '', address: 'Royal London Hospital',
  },
  {
    id: 'sc3', ward: 'A&E', department: 'Emergency Department',
    date: 'Sun 29 Jun', time: '19:00 – 07:00', dateISO: '2026-06-29',
    duration: '12 hrs', type: 'Night', rate: '£27/hr', spots: 0,
    notes: '', address: 'Royal London Hospital',
  },
]
