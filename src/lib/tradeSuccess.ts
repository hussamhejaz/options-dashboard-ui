type Numeric = number | string | null | undefined

export type TradeSuccessInput = {
  isSuccessful?: boolean | null
  pnl?: Numeric
  pnlAmount?: Numeric
}

export type ReportOutcomeInput = TradeSuccessInput & {
  closePrice?: Numeric
  pnlPercent?: Numeric
  closePriceActual?: Numeric
  pnlAmountActual?: Numeric
  pnlPercentActual?: Numeric
}

export const toFiniteNumber = (value: Numeric): number | undefined => {
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

export const resolveTradeSuccess = (trade: TradeSuccessInput): { isSuccessful: boolean; isExplicit: boolean } => {
  if (typeof trade.isSuccessful === 'boolean') {
    return { isSuccessful: trade.isSuccessful, isExplicit: true }
  }

  const pnlCandidate = toFiniteNumber(trade.pnlAmount) ?? toFiniteNumber(trade.pnl) ?? 0
  return { isSuccessful: pnlCandidate > 0, isExplicit: false }
}

export const getTradeSuccessLabel = (trade: TradeSuccessInput): 'ناجحة' | 'خاسرة' =>
  resolveTradeSuccess(trade).isSuccessful ? 'ناجحة' : 'خاسرة'

export const hasActualOutcome = (trade: ReportOutcomeInput): boolean =>
  toFiniteNumber(trade.closePriceActual) !== undefined ||
  toFiniteNumber(trade.pnlAmountActual) !== undefined ||
  toFiniteNumber(trade.pnlPercentActual) !== undefined

export const getReportedClosePrice = (trade: ReportOutcomeInput): number | undefined =>
  toFiniteNumber(trade.closePrice)

export const getReportedPnlAmount = (trade: ReportOutcomeInput): number | undefined =>
  toFiniteNumber(trade.pnlAmount) ?? toFiniteNumber(trade.pnl)

export const getReportedPnlPercent = (trade: ReportOutcomeInput): number | undefined =>
  toFiniteNumber(trade.pnlPercent)
