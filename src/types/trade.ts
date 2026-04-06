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
  /** Main report PnL from backend (peak-based logic) */
  pnl?: number | null
  /** Actual exit PnL from backend */
  pnlActual?: number | null
  /** Peak/highest price reached while trade was open */
  peakPriceReached?: number | null
  /** Peak rise in price from entry */
  peakRisePrice?: number | null
  /** Peak rise percent from entry */
  peakRisePercent?: number | null
  /** PnL amount at peak/high price */
  peakPnlAmount?: number | null
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
