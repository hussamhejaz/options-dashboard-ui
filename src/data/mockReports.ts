export type ReportItem = {
  id: string
  name: string
  period: string
  createdAt: string
  status: 'مكتمل' | 'قيد المعالجة'
  summary: string
}

export const reportCards = [
  {
    id: 'daily',
    title: 'تقرير يومي',
    description: 'نظرة سريعة على أداء اليوم مع أبرز المتحركات.',
    stats: ['12 صفقة', 'نسبة الربح 64%', 'أفضل رمز: AAPL']
  },
  {
    id: 'weekly',
    title: 'تقرير أسبوعي',
    description: 'تجميع أداء الأسبوع مع رسم بياني للتقلبات.',
    stats: ['58 صفقة', 'نسبة الربح 70%', 'صافي الربح $18,400']
  },
  {
    id: 'monthly',
    title: 'تقرير شهري',
    description: 'تحليل شهري لاستراتيجيات الخيارات والأصول الأعلى ربحية.',
    stats: ['210 صفقة', 'نسبة الربح 66%', 'أفضل قطاع: تكنولوجيا']
  }
]

export const reportList: ReportItem[] = [
  { id: 'r1', name: 'ملخص يومي - الإثنين', period: 'يومي', createdAt: '2026-02-07', status: 'مكتمل', summary: 'ارتفاع في أسهم التقنية' },
  { id: 'r2', name: 'ملخص أسبوع أول فبراير', period: 'أسبوعي', createdAt: '2026-02-05', status: 'قيد المعالجة', summary: 'تحول في الطاقة الخضراء' },
  { id: 'r3', name: 'نظرة شهر يناير', period: 'شهري', createdAt: '2026-02-01', status: 'مكتمل', summary: 'تحسن كبير في أسهم الذكاء الاصطناعي' }
]

export const reportSummary = [
  { id: 'total', label: 'إجمالي الصفقات', value: '210' },
  { id: 'winrate', label: 'نسبة الربح', value: '66%' },
  { id: 'bestSymbol', label: 'أفضل رمز', value: 'NVDA' },
  { id: 'net', label: 'صافي الربح', value: '$42,800' }
]
