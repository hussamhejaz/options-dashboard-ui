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
  closePriceActual?: number | null
  /** Absolute PnL in dollars if provided by the API */
  pnlAmount?: number
  /** Absolute actual close PnL in dollars if provided by the API */
  pnlAmountActual?: number | null
  /** Percent actual close PnL if provided by the API */
  pnlPercentActual?: number | null
  /** Backend success status for a trade regardless of raw pnl */
  isSuccessful?: boolean | null
  /** Backend success rule name (e.g. PROFIT_TARGET_50_REACHED) */
  successRule?: string | null
  /** True if report pnl was computed from peak/high price */
  usedHighPriceForReport?: boolean | null
  /** Last mid-price returned from quotes stream */
  lastMidPrice?: number
  /** Last price we notified on (for alerts) */
  lastNotifiedPrice?: number
  pl: number
  status: TradeStatus
  contracts: number
  stopLoss?: number | null
}
