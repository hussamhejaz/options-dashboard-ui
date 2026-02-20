import { ApiError, apiClient } from './apiClient'

export type AdListItem = {
  id: string
  title?: string
  content?: string
  status?: string
  symbol?: string
  right?: 'call' | 'put'
  expiration?: string
  createdAt?: string | number | null
}

export type DeleteAdOutcome =
  | { kind: 'success'; message: string }
  | { kind: 'not_found'; message: string }
  | { kind: 'error'; message: string }

export type DeleteAdUiState = {
  ads: AdListItem[]
  toast: { type: 'success' | 'error'; message: string }
}

export const applyDeleteAdOutcome = (
  ads: AdListItem[],
  adId: string,
  outcome: DeleteAdOutcome
): DeleteAdUiState => {
  if (outcome.kind === 'success') {
    return {
      ads: ads.filter((ad) => ad.id !== adId),
      toast: { type: 'success', message: 'تم حذف الإعلان' }
    }
  }

  if (outcome.kind === 'not_found') {
    return {
      ads: ads.filter((ad) => ad.id !== adId),
      toast: { type: 'error', message: 'الإعلان غير موجود' }
    }
  }

  return {
    ads,
    toast: { type: 'error', message: outcome.message || 'تعذر حذف الإعلان' }
  }
}

export const deleteAdByIdRequest = async (adId: string): Promise<DeleteAdOutcome> => {
  const id = String(adId ?? '').trim()
  if (!id) return { kind: 'error', message: 'معرّف الإعلان غير صالح' }

  try {
    await apiClient.delete(`/ads/${encodeURIComponent(id)}`, { timeoutMs: 12000 })
    return { kind: 'success', message: 'تم حذف الإعلان' }
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { kind: 'not_found', message: 'الإعلان غير موجود' }
    }
    if (err instanceof Error) {
      return { kind: 'error', message: err.message || 'تعذر حذف الإعلان' }
    }
    return { kind: 'error', message: 'تعذر الاتصال بالخادم. حاول مرة أخرى.' }
  }
}
