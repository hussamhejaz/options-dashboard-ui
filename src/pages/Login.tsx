import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/images/logo.jpeg'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // لاحقاً سنضيف التحقق الفعلي
    setTimeout(() => {
      setLoading(false)
      navigate('/')
    }, 400)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d0a1a] via-[#120d24] to-[#0d0a1a] px-4" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <img src={logo} alt="شعار" className="w-48 h-20 object-contain drop-shadow-[0_15px_35px_rgba(79,70,229,0.3)]" />
        </div>
        <div className="rounded-3xl border border-purple-700/50 bg-[#120e1f]/80 shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center text-2xl text-purple-200 font-bold">
              دخول
            </div>
            <h1 className="text-2xl font-bold text-white">تسجيل الدخول</h1>
            <p className="text-sm text-slate-400">أدخل بريدك الإلكتروني وكلمة المرور للمتابعة إلى لوحة التحكم.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#0f0b1d]/80 border border-purple-700/40 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-purple-400"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#0f0b1d]/80 border border-purple-700/40 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-purple-400"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-purple-500 text-white font-semibold py-3 text-sm hover:bg-purple-400 transition disabled:opacity-60"
            >
              {loading ? 'جارٍ الدخول...' : 'دخول'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            سيتم إضافة التحقق لاحقًا، حالياً يتم تحويلك مباشرةً للوحة التحكم عند الضغط على دخول.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
