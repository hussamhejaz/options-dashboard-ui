import { useState } from 'react'
import type { FC } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import type { AdStatus, Ad } from '../../data/mockAds'

type Props = {
  initial?: Partial<Ad>
  onSave: (ad: Ad) => void
  onCancel: () => void
}

const statusOptions: AdStatus[] = ['نشط', 'متوقف', 'منتهي']

const AdForm: FC<Props> = ({ initial = {}, onSave, onCancel }) => {
  const [form, setForm] = useState<Partial<Ad>>({
    title: initial.title || '',
    description: initial.description || '',
    image: initial.image || '',
    link: initial.link || '',
    status: initial.status || 'نشط'
  })

  const handleChange = (key: keyof Ad, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.image) return
    const payload: Ad = {
      id: initial.id || crypto.randomUUID(),
      title: form.title,
      description: form.description,
      image: form.image,
      link: form.link,
      status: (form.status as AdStatus) || 'نشط'
    }
    onSave(payload)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} dir="rtl">
      <Input label="العنوان" value={form.title} onChange={(e) => handleChange('title', e.target.value)} required />
      <Input label="الوصف" value={form.description} onChange={(e) => handleChange('description', e.target.value)} required />
      <Input label="رابط الصورة" value={form.image} onChange={(e) => handleChange('image', e.target.value)} required />
      <Input label="رابط خارجي (اختياري)" value={form.link} onChange={(e) => handleChange('link', e.target.value)} />
      <Select label="الحالة" value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
        {statusOptions.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </Select>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>إلغاء</Button>
        <Button type="submit">حفظ</Button>
      </div>
    </form>
  )
}

export default AdForm
