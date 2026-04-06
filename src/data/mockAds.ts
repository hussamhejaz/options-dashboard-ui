export type AdStatus = 'نشط' | 'متوقف' | 'منتهي'

export type Ad = {
  id: string
  title: string
  description: string
  image: string
  link?: string
  status: AdStatus
}

export const mockAds: Ad[] = [
  {
    id: 'ad1',
    title: 'إشعار فرص أسبوعي',
    description: 'رسالة أسبوعية بأفضل فرص الـ CALL مع تحليل التقلبات.',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=600&q=80',
    link: '#',
    status: 'نشط'
  },
  {
    id: 'ad2',
    title: 'تنبيه فجوات الافتتاح',
    description: 'إرسال مباشر لأي فجوة سعرية تتجاوز 2%.',
    image: 'https://images.unsplash.com/photo-1520607162513-0b6c98d0f6b9?auto=format&fit=crop&w=600&q=80',
    status: 'متوقف'
  },
  {
    id: 'ad3',
    title: 'برنامج ولاء المتداولين',
    description: 'استرداد نقدي على العمولات للصفقات المغلقة أسبوعياً.',
    image: 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=600&q=80',
    link: '#',
    status: 'منتهي'
  }
]
