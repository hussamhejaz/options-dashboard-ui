export type AdStatus = 'draft' | 'ready' | 'sent'

export type Ad = {
  id: string
  title: string
  content?: string
  status: AdStatus
  tradeId?: string
  symbol?: string
  right?: 'call' | 'put'
  
  strike?: number
  expiration?: string
  entryPrice?: number | null
  closePrice?: number | null
  pnlAmount?: number | null
  pnlPercent?: number | null
  openInterest?: number | null
  volume?: number | null
  createdAt?: string | number | null
  updatedAt?: string | number | null
  lastSentAt?: string | number | null
}
