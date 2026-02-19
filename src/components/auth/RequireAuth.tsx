import { Navigate, useLocation } from 'react-router-dom'
import type { ReactElement } from 'react'

const AUTH_KEY = 'authPassword'
const AUTH_VALUE = 'Rukn2030'

export const isAuthenticated = () => localStorage.getItem(AUTH_KEY) === AUTH_VALUE

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

export const setAuthenticated = () => localStorage.setItem(AUTH_KEY, AUTH_VALUE)
export const clearAuthenticated = () => localStorage.removeItem(AUTH_KEY)
export const getAuthKey = () => AUTH_KEY
export const getAuthValue = () => AUTH_VALUE

export default RequireAuth
