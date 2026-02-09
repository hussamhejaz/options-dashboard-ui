import type { Trade } from '../types/trade'

export const mockTrades: Trade[] = [
  {
    id: '1',
    symbol: 'AAPL',
    type: 'CALL',
    strike: 190,
    expiry: '2026-03-15',
    entryPrice: 5.2,
    currentPrice: 7.1,
    pl: 36.5,
    status: 'open',
    contracts: 4
  },
  {
    id: '2',
    symbol: 'TSLA',
    type: 'PUT',
    strike: 190,
    expiry: '2026-02-28',
    entryPrice: 8.4,
    currentPrice: 6.2,
    pl: -26.2,
    status: 'open',
    contracts: 2
  },
  {
    id: '3',
    symbol: 'NVDA',
    type: 'CALL',
    strike: 750,
    expiry: '2026-03-22',
    entryPrice: 12.6,
    currentPrice: 14.1,
    pl: 11.9,
    status: 'closed',
    contracts: 3
  },
  {
    id: '4',
    symbol: 'AMZN',
    type: 'CALL',
    strike: 155,
    expiry: '2026-02-20',
    entryPrice: 4.5,
    currentPrice: 4.1,
    pl: -8.9,
    status: 'open',
    contracts: 5
  },
  {
    id: '5',
    symbol: 'META',
    type: 'PUT',
    strike: 460,
    expiry: '2026-02-25',
    entryPrice: 7.9,
    currentPrice: 10.2,
    pl: 29.1,
    status: 'closed',
    contracts: 1
  },
  {
    id: '6',
    symbol: 'MSFT',
    type: 'CALL',
    strike: 410,
    expiry: '2026-04-05',
    entryPrice: 6.8,
    currentPrice: 6.9,
    pl: 1.4,
    status: 'open',
    contracts: 6
  }
]
