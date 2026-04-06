const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'https://api.rukn.life'

const buildUrl = (path: string): string => {
  const trimmed = String(path ?? '').trim()
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const baseHasApi = /\/api$/i.test(API_BASE_URL)
  const pathHasApi = /^\/api(\/|$)/i.test(normalizedPath)

  if (baseHasApi) {
    const safePath = pathHasApi ? normalizedPath.replace(/^\/api/i, '') || '/' : normalizedPath
    return `${API_BASE_URL}${safePath}`
  }

  const safePath = pathHasApi ? normalizedPath : `/api${normalizedPath}`
  return `${API_BASE_URL}${safePath}`
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  timeoutMs?: number
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, timeoutMs = 15000, signal, ...rest } = options
  const controller = new AbortController()
  let didTimeout = false
  const timeoutId =
    timeoutMs > 0
      ? window.setTimeout(() => {
          didTimeout = true
          controller.abort()
        }, timeoutMs)
      : null

  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason)
    } else {
      signal.addEventListener(
        
        'abort',
        () => {
          controller.abort(signal.reason)
        },
        { once: true }
      )
    }
  }

  try {
    const response = await fetch(buildUrl(path), {
      method: 'GET',
      ...rest,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const message = await readErrorMessage(response)
      throw new ApiError(message || `Request failed with status ${response.status}`, response.status)
    }

    if (response.status === 204) {
      // No content
      return undefined as T
    }

    return response.json() as Promise<T>
  } catch (err) {
    if (err instanceof ApiError) {
      throw err
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      if (didTimeout) {
        throw new Error('انتهت مهلة الاتصال بالخادم. حاول مرة أخرى.')
      }
      if (signal?.aborted) throw err
      throw new Error('انتهت مهلة الاتصال بالخادم. حاول مرة أخرى.')
    }
    if (err instanceof Error && /request timeout|timeout/i.test(err.message)) {
      throw new Error('انتهت مهلة الاتصال بالخادم. حاول مرة أخرى.')
    }
    if (err instanceof TypeError) {
      throw new Error('تعذر الاتصال بالخادم. تأكد من تشغيل الباك-إند.')
    }
    throw err
  } finally {
    if (timeoutId !== null) window.clearTimeout(timeoutId)
  }
}

async function readErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const data = await response.json() as { message?: string }
    return data?.message
  } catch {
    return undefined
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' })
}
