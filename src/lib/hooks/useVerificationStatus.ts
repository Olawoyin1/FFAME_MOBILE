import { useState, useEffect } from 'react'
import { get } from '../api'

export interface VerificationStatus {
  runId: string
  complianceState: string
  complianceScore: number
  lastRunAt: string
  checksPerformed: string[]
  blockchainTxId?: string
}

export function useVerificationStatus(userId: string | undefined) {
  const [verification, setVerification] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    get<{ success: boolean; data: VerificationStatus }>(`/verifications/${userId}`)
      .then(res => setVerification(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  return { verification, loading }
}
