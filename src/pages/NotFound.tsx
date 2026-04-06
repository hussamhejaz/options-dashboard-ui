import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4" dir="rtl">
      <div className="text-5xl">🛰️</div>
      <h1 className="text-2xl font-bold text-white">الصفحة غير موجودة</h1>
      <p className="text-slate-400">الرابط الذي تحاول الوصول إليه غير متاح. تأكد من العنوان أو عد للوحة التحكم.</p>
      <Button onClick={() => navigate('/')}>العودة للوحة التحكم</Button>
    </div>
  )
}

export default NotFound
