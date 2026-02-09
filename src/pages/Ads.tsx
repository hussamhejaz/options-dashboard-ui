import { useMemo, useRef, useState } from 'react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { mockTrades } from '../data/mockTrades'

const Ads = () => {
  const [botToken, setBotToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const cardRef = useRef<HTMLDivElement | null>(null)

  const winningToday = useMemo(() => {
    // افتراض: نأخذ أعلى صفقة رابحة كـ "التقرير اليومي"
    const wins = mockTrades.filter((t) => t.pl > 0)
    if (wins.length === 0) return null
    return wins.reduce((max, t) => (t.pl > max.pl ? t : max), wins[0])
  }, [])

  const message = winningToday
    ? `تقرير الصفقة الرابحة اليوم:\n` +
      `الرمز: ${winningToday.symbol}\n` +
      `النوع: ${winningToday.type}\n` +
      `سعر الدخول: $${winningToday.entryPrice.toFixed(2)}\n` +
      `السعر الحالي: $${winningToday.currentPrice.toFixed(2)}\n` +
      `نسبة الربح: ${winningToday.pl.toFixed(2)}%\n` +
      `عقود: ${winningToday.contracts}`
    : 'لا توجد صفقات رابحة لإرسالها اليوم.'

  const handleSend = () => {
    // ملاحظة: لا يوجد باك-إند هنا. هذا الزر فقط يوضح الرسالة الجاهزة للإرسال.
    // للإرسال الفعلي إلى تيليجرام، استخدم طلب POST إلى:
    // https://api.telegram.org/bot<token>/sendMessage مع المعاملات chat_id و text
    if (!winningToday) return
    if (!botToken || !chatId) {
      setStatus('error')
      return
    }
    setStatus('success')
    // يمكن دمج طلب fetch هنا عند توصيل الباك-إند.
  }

  const exportCardAsImage = async () => {
    // الميزة تحتاج الحزمة html-to-image، غير متوفرة حالياً بدون اتصال
    alert('لتصدير الصورة ثبّت الحزمة html-to-image: npm install html-to-image ثم أعد المحاولة.')
    setStatus('error')
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-white">إرسال التقرير اليومي لتيليجرام</h2>
        <p className="text-slate-400 text-sm mt-1">
          توليد رسالة الصفقة الرابحة اليوميًا وإرسالها إلى قناة تيليجرام.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Bot Token</span>
          <input
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="123456:ABC-DEF..."
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Chat ID / Channel ID</span>
          <input
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="@channel_username أو رقم chat_id"
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">الرسالة الجاهزة للإرسال</p>
            <h3 className="text-lg font-semibold text-white">الصفقة الرابحة اليوم</h3>
          </div>
          <Badge variant={winningToday ? 'emerald' : 'gray'}>
            {winningToday ? 'جاهز' : 'لا توجد صفقات رابحة'}
          </Badge>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-slate-100 bg-slate-900/70 border border-slate-800 rounded-xl p-3">
{message}
        </pre>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigator.clipboard?.writeText(message)}
            variant="secondary"
            disabled={!winningToday}
          >
            نسخ الرسالة
          </Button>
          <Button onClick={handleSend} disabled={!winningToday}>
            إرسال إلى تيليجرام (يدوي)
          </Button>
          {status === 'error' && <span className="text-sm text-red-300">أدخل التوكن و الـ Chat ID أولاً</span>}
          {status === 'success' && <span className="text-sm text-emerald-300">تم تجهيز الطلب (أضف استدعاء الـ API فعليًا)</span>}
        </div>
        <p className="text-xs text-slate-500">
          لدمج الإرسال الفعلي: استدعِ <code>POST https://api.telegram.org/bot&lt;token&gt;/sendMessage</code> مع
          <code>chat_id</code> و <code>text</code>. يمكن وضعه في خدمة backend صغيرة أو وظيفة serverless.
        </p>
      </div>

      {/* معاينة البطاقة بشكل مشابه للصورة المطلوبة */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">معاينة البطاقة (إرسال صورة)</h3>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportCardAsImage} disabled={!winningToday}>
              تصدير كصورة PNG
            </Button>
          </div>
        </div>
        <div
          ref={cardRef}
          className="relative w-full max-w-3xl rounded-2xl overflow-hidden bg-[#0f0d15] border border-purple-700/60 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.8)]"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-purple-700/60 bg-[#161124]">
            <div className="space-y-1">
              <div className="text-xl font-bold text-white">
                {winningToday ? `${winningToday.symbol} (${winningToday.strike})` : 'لا توجد صفقة'}
              </div>
              <div className="text-sm text-gray-300">
                {winningToday ? `${winningToday.expiry} ${winningToday.type.toLowerCase()}` : ''}
              </div>
            </div>
            <div className="text-purple-300 font-semibold flex items-center gap-2">
              <span className="w-2 h-5 bg-red-500 block" />
              <span className="w-2 h-6 bg-green-500 block" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 items-center">
            <div className="md:col-span-2 flex items-center gap-6">
              <div className="text-6xl font-extrabold text-emerald-500 leading-none">
                {winningToday ? winningToday.currentPrice.toFixed(2) : '--'}
              </div>
              <div className="space-y-1 text-sm text-emerald-300">
                <div>{winningToday ? (winningToday.currentPrice - winningToday.entryPrice).toFixed(2) + ' $' : '--'}</div>
                <div>{winningToday ? `${winningToday.pl.toFixed(1)}%` : '--'}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-white text-lg">
              <div className="flex justify-between">
                <span className="text-gray-300">Mid :</span>
                <span>{winningToday ? (winningToday.currentPrice - 0.6).toFixed(2) : '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Open Int :</span>
                <span>{winningToday ? 350 : '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Vol :</span>
                <span>{winningToday ? 300 : '--'}</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 flex items-center gap-3">
            <span className="text-sm text-gray-400">🇺🇸</span>
            <span className="text-sm text-gray-400">🇸🇦</span>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          للتصدير كصورة PNG استخدم الزر أعلاه (تحتاج الحزمة <code>html-to-image</code>). لإرسال الصورة إلى تيليجرام استعمل
          <code>sendPhoto</code> مع الملف الناتج.
        </p>
      </div>
    </div>
  )
}

export default Ads
