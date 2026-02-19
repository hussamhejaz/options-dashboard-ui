import { useCallback, useState } from 'react'
import { apiClient } from '../lib/apiClient'
import type { Trade, TradeStatus, TradeType } from '../types/trade'

export type NewTradePayload = {
  symbol: string
  type: TradeType
  strike: number
  expiry: string
  entryPrice: number
  contracts: number
  stopLoss?: number | null
}

export type CreateTradeInput = {
  symbol: string
  right: 'call' | 'put'
  strike: number
  expiration: string // YYYYMMDD
  contracts?: number
  entryPrice?: number
  stopLoss?: number | null
}


type ApiTrade = Partial<{
  id: string
  symbol: string
  type: TradeType
  right: TradeType | string
  strike: number | string
  expiration: string
  expiry: string
  entryPrice: number | string
  price: number | string
  currentPrice: number | string
  mark: number | string
  pl: number | string
  pnl: number | string
  status: TradeStatus
  contracts: number | string
  quantity: number | string
}>

export const useCreateTrade = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTrade = useCallback(async (payload: CreateTradeInput): Promise<Trade> => {
    const symbol = payload.symbol.trim().toUpperCase()
    const tickerLooksValid = /^[A-Z0-9]{1,10}(?:[.\-][A-Z0-9]{1,4})?$/.test(symbol)
    if (!tickerLooksValid) {
      const message = 'اكتب رمز سهم صالح (مثال: AAPL، TSLA، BRK.B)'
      setError(message)
      throw new Error(message)
    }
    if (!/^[0-9]{8}$/.test(payload.expiration)) {
      const message = 'صيغة تاريخ الانتهاء غير صحيحة (استخدم YYYY-MM-DD أو DD/MM/YYYY)'
      setError(message)
      throw new Error(message)
    }
    if (!Number.isFinite(payload.strike)) {
      const message = 'قيمة السترايك غير صالحة'
      setError(message)
      throw new Error(message)
    }

    setLoading(true)
    setError(null)
    try {
      const payloadForApi: CreateTradeInput = {
        symbol,
        right: payload.right,
        strike: payload.strike,
        expiration: payload.expiration,

        contracts: payload.contracts,
        entryPrice: payload.entryPrice,
        stopLoss: payload.stopLoss
      }
      const created = await apiClient.post<ApiTrade>('/trades', payloadForApi, { timeoutMs: 120000 })
      return toTrade(created, payloadForApi)
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'تعذر إرسال الصفقة'
      const message =
        tickerLooksValid && rawMessage.includes('اكتب رمز سهم صالح')
          ? 'الرمز صالح، لكن عقد الأوبشن غير متاح. تأكد من السترايك وتاريخ الانتهاء.'
          : rawMessage
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { createTrade, loading, error }
}

const toTrade = (apiTrade: ApiTrade | undefined, fallback: CreateTradeInput): Trade => {
  const entryRaw = apiTrade?.entryPrice ?? apiTrade?.price ?? fallback.entryPrice ?? fallback.strike
  const entry = Number(entryRaw)
  const currentRaw = apiTrade?.currentPrice ?? apiTrade?.mark ?? apiTrade?.price ?? apiTrade?.entryPrice ?? entry
  const current = Number(currentRaw)
  const statusRaw = (apiTrade?.status ?? 'OPEN').toString().toLowerCase()

  const expiryValue = apiTrade?.expiration ?? apiTrade?.expiry ?? fallback.expiration
  const formattedExpiry =
    /^[0-9]{8}$/.test(expiryValue ?? '')
      ? `${expiryValue.slice(0, 4)}-${expiryValue.slice(4, 6)}-${expiryValue.slice(6, 8)}`
      : expiryValue ?? ''

  return {
    id: apiTrade?.id ?? crypto.randomUUID(),
    symbol: apiTrade?.symbol ?? fallback.symbol,
    type: ((apiTrade?.type ?? apiTrade?.right ?? fallback.right) as TradeType)?.toUpperCase() as TradeType,
    strike: Number(apiTrade?.strike ?? fallback.strike),
    expiry: formattedExpiry,
    entryPrice: entry,
    currentPrice: current,
    pl: Number(apiTrade?.pl ?? apiTrade?.pnl ?? 0),
    status: (statusRaw === 'closed' ? 'closed' : 'open') as TradeStatus,
    contracts: Number(apiTrade?.contracts ?? apiTrade?.quantity ?? fallback.contracts ?? 1)
  }
}
