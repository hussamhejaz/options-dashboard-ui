import { useState } from 'react'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import { mockUser } from '../data/mockUser'

const Settings = () => {
  const [user, setUser] = useState({ name: mockUser.name, email: mockUser.email })
  const [theme, setTheme] = useState('داكن')
  const [fontSize, setFontSize] = useState('عادي')
  const [telegram, setTelegram] = useState(true)
  const [priceThreshold, setPriceThreshold] = useState(5)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">الإعدادات</h2>
          <p className="text-slate-400 text-sm mt-1">تخصيص حسابك وتفضيلات العرض والتنبيهات.</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSave}>
        <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <h3 className="text-lg font-semibold text-white">حساب المستخدم</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="اسم المستخدم"
              value={user.name}
              onChange={(e) => setUser((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={user.email}
              onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <h3 className="text-lg font-semibold text-white">إعدادات العرض</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="الوضع" value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="داكن">داكن</option>
              <option value="فاتح" disabled>فاتح (غير متاح)</option>
            </Select>
            <Select label="حجم الخط" value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              <option value="صغير">صغير</option>
              <option value="عادي">عادي</option>
              <option value="كبير">كبير</option>
            </Select>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <h3 className="text-lg font-semibold text-white">إعدادات التنبيهات</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                className="accent-emerald-500 w-4 h-4"
                checked={telegram}
                onChange={(e) => setTelegram(e.target.checked)}
              />
              تفعيل إشعارات تيليجرام
            </label>
            <Input
              label="حد التغير السعري للتنبيه (%)"
              type="number"
              min="1"
              step="0.5"
              value={priceThreshold}
              onChange={(e) => setPriceThreshold(Number(e.target.value))}
            />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit">حفظ الإعدادات</Button>
          {saved && <span className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 rounded-lg">تم الحفظ</span>}
        </div>
      </form>
    </div>
  )
}

export default Settings
