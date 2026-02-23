import {
  getActualPnlAmount,
  getReportedClosePrice,
  getReportedElevationPrice,
  getReportedPnlAmount,
  getTradeSuccessLabel,
  resolveTradeSuccess
} from './tradeSuccess'

type ScenarioTrade = {
  isSuccessful?: boolean
  pnlAmount?: number
  pnl?: number
  pnlActual?: number
  pnlAmountActual?: number
  highPrice?: number
  peakPriceReached?: number
  closePrice?: number
  closePriceActual?: number
  successRule?: string
  usedHighPriceForReport?: boolean
}

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const runTradeSuccessScenarios = () => {
  // A) حققت 50$ ثم أغلقت تحت الدخول: تبقى "ناجحة"
  const scenarioA: ScenarioTrade = {
    isSuccessful: true,
    pnl: 50,
    pnlAmount: 50,
    pnlActual: -12,
    pnlAmountActual: -12,
    successRule: 'PROFIT_TARGET_50_REACHED'
  }
  assert(resolveTradeSuccess(scenarioA).isSuccessful === true, 'Scenario A should be successful')
  assert(getReportedPnlAmount(scenarioA) === 50, 'Scenario A should prefer pnl as main report result')
  assert(getTradeSuccessLabel(scenarioA) === 'ناجحة', 'Scenario A label should be "ناجحة"')
  assert((getActualPnlAmount(scenarioA) ?? 0) <= 0, 'Scenario A actual pnl should be <= 0')

  // B) حققت 50$ ولم تهبط: التقرير يعرض closePrice (الأعلى) عند تفعيل usedHighPriceForReport
  const scenarioB: ScenarioTrade = {
    isSuccessful: true,
    usedHighPriceForReport: true,
    highPrice: 4.6,
    peakPriceReached: 4.8,
    closePrice: 4.8,
    closePriceActual: 4.1,
    successRule: 'PROFIT_TARGET_50_REACHED'
  }
  assert(scenarioB.usedHighPriceForReport === true, 'Scenario B should flag high price usage')
  assert(getReportedClosePrice(scenarioB) === 4.8, 'Scenario B should display report closePrice')
  assert(getReportedElevationPrice(scenarioB) === 4.8, 'Scenario B elevation should prefer peakPriceReached')

  // C) ربح فعلي موجب بدون تحقيق 50$: نجاح وفق POSITIVE_PNL
  const scenarioC: ScenarioTrade = {
    isSuccessful: true,
    pnl: 28,
    pnlAmountActual: 28,
    successRule: 'POSITIVE_PNL'
  }
  assert(resolveTradeSuccess(scenarioC).isSuccessful === true, 'Scenario C should be successful')
  assert(scenarioC.successRule === 'POSITIVE_PNL', 'Scenario C should keep POSITIVE_PNL rule')
}

runTradeSuccessScenarios()
