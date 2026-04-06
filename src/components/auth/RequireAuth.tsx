import { Navigate, useLocation } from 'react-router-dom'
import type { ReactElement } from 'react'

const AUTH_KEY = 'authPassword'
const AUTH_VALUE = 'Mm1994'
const AUTH_SESSION_VERSION = '2026-03-06'

type StoredAuth = {
  value: string
  version: string
}

const parseStoredAuth = (raw: string | null): StoredAuth | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredAuth
    if (typeof parsed.value !== 'string' || typeof parsed.version !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

export const isAuthenticated = () => {
  const stored = parseStoredAuth(localStorage.getItem(AUTH_KEY))
  return stored?.value === AUTH_VALUE && stored.version === AUTH_SESSION_VERSION
}

type Props = {
  children: ReactElement
}

const RequireAuth = ({ children }: Props) => {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

export const clearAuthenticated = () => localStorage.removeItem(AUTH_KEY)
export const getAuthKey = () => AUTH_KEY
export const getAuthValue = () => AUTH_VALUE
export const isValidPassword = (password: string) => password === AUTH_VALUE

export const setAuthenticated = () => {
  const payload: StoredAuth = { value: AUTH_VALUE, version: AUTH_SESSION_VERSION }
  localStorage.setItem(AUTH_KEY, JSON.stringify(payload))
}

export default RequireAuth
