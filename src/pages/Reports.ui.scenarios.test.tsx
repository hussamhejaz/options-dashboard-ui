import { renderToStaticMarkup } from 'react-dom/server'
import { formatWinRate, PeakMetricsSection, UsedHighPriceBadge, type ReportItem } from './Reports'

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const buildReport = (overrides: Partial<ReportItem> = {}): ReportItem => ({
  id: 'report-1',
  tradeId: 'trade-1',
  symbol: 'TSLA',
  right: 'CALL',
  strike: 300,
  expiration: '20270115',
  contracts: 1,
  entryPrice: 2.4,
  status: 'closed',
  ...overrides
})

const runReportUiScenarios = () => {
  // A) Report with peak fields populated
  const withPeaksHtml = renderToStaticMarkup(
    <PeakMetricsSection
      report={buildReport({
        peakPriceReached: 4.876,
        peakRisePrice: 2.476,
        peakRisePercent: 103.166,
        peakPnlAmount: 247.652
      })}
    />
  )
  assert(withPeaksHtml.includes('أعلى سعر وصل'), 'Scenario A should include peak price label')
  assert(withPeaksHtml.includes('4.88'), 'Scenario A should format peakPriceReached to 2 decimals')
  assert(withPeaksHtml.includes('2.48'), 'Scenario A should format peakRisePrice to 2 decimals')
  assert(withPeaksHtml.includes('103.17%'), 'Scenario A should format peakRisePercent to 2 decimals with %')
  assert(withPeaksHtml.includes('247.65$'), 'Scenario A should format peakPnlAmount to 2 decimals with $')

  // B) Old report with missing peak fields
  const legacyHtml = renderToStaticMarkup(<PeakMetricsSection report={buildReport()} />)
  const fallbackMatches = legacyHtml.match(/—/g) ?? []
  assert(fallbackMatches.length >= 4, 'Scenario B should show fallback "—" for missing peak fields')

  // C) usedHighPriceForReport badge visible when true
  const badgeHtml = renderToStaticMarkup(<UsedHighPriceBadge enabled={true} />)
  assert(badgeHtml.includes('تم اعتماد أعلى سعر في التقرير'), 'Scenario C should show usedHighPriceForReport badge')

  // D) winRate formatting supports values > 100%
  assert(formatWinRate(386.42) === '386.42%', 'Scenario D should render winRate with 2 decimals and %')
  assert(formatWinRate(undefined) === '0.00%', 'Scenario D should fallback to 0.00% when winRate is missing')
}

runReportUiScenarios()
