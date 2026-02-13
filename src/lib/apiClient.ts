const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001/api'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  })

  if (!response.ok) {
    const message = await readErrorMessage(response)
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    // No content
    return undefined as T
  }

  return response.json() as Promise<T>
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
