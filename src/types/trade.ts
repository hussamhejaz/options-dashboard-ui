export type TradeStatus = 'open' | 'closed'
export type TradeType = 'CALL' | 'PUT'

export type Trade = {
  id: string
  symbol: string
  type: TradeType
  strike: number
  expiry: string
  entryPrice: number
  currentPrice: number
  pl: number
  status: TradeStatus
  contracts: number
}
