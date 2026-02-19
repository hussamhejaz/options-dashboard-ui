import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { setAuthenticated, isAuthenticated } from '../components/auth/RequireAuth'
import logo from '../assets/images/logo.jpeg'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/')
    }
  }, [navigate])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const redirectTo = (location.state as any)?.from || '/'
    if (password === 'Rukn2030') {
      setAuthenticated()
      navigate(redirectTo, { replace: true })
    } else {
      setError('كلمة المرور غير صحيحة')
    }
    setLoading(false)
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
            <p className="text-sm text-slate-400">الوصول محمي بكلمة مرور. استخدم كلمة المرور الصحيحة للمتابعة.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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

          {error && <p className="text-center text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default Login
