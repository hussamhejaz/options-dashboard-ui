export type TradeStatus = 'open' | 'closed' | 'invalid'
export type TradeType = 'CALL' | 'PUT'

export type Trade = {
  id: string
  symbol: string
  type: TradeType
  strike: number
  expiry: string
  entryPrice: number
  currentPrice: number
  highPrice?: number | null
  closePrice?: number
  /** Absolute PnL in dollars if provided by the API */
  pnlAmount?: number
  /** Last mid-price returned from quotes stream */
  lastMidPrice?: number
  /** Last price we notified on (for alerts) */
  lastNotifiedPrice?: number
  pl: number
  status: TradeStatus
  contracts: number
  stopLoss?: number | null
}
