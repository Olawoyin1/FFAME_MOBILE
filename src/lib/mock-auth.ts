export interface StaffUser {
  id: string
  email: string
  name: string
  role: 'healthcare_professional'
  specialty: string
  ward: string
  trust: string
  tenant: string
  nhsId: string
  phone: string
  eligibilityStatus: 'verified' | 'pending' | 'suspended'
  eligibilityLastUpdated: string
}

const MOCK_STAFF: StaffUser & { password: string } = {
  id: 'staff_001',
  email: 'dr.adebayo@nhs.net',
  password: 'password123',
  name: 'Dr. Emmanuel Adebayo',
  role: 'healthcare_professional',
  specialty: 'Emergency Medicine',
  ward: 'A&E',
  trust: 'Royal London NHS Trust',
  tenant: 'Royal London NHS Trust',
  nhsId: 'NHS-2847193',
  phone: '+44 7700 900123',
  eligibilityStatus: 'verified',
  eligibilityLastUpdated: '14 Jun 2026',
}

export function mockStaffLogin(email: string, password: string): Promise<StaffUser> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const normalised = email.toLowerCase().trim()
      if (normalised !== MOCK_STAFF.email && normalised !== 'staff@ffame.com') {
        reject(new Error('No NHS-linked account found for this email.'))
        return
      }
      if (password !== MOCK_STAFF.password) {
        reject(new Error('Incorrect password. Please try again.'))
        return
      }
      const { password: _p, ...safe } = MOCK_STAFF
      resolve(safe)
    }, 900)
  })
}

export function mockStaffLogout(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 200))
}
