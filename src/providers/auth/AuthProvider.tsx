"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { getAccessToken, isAuthenticated, logout } from "./sign-in"

interface AuthContextType {
  isAuthenticated: boolean
  accessToken: string | null
  logout: () => void
  setAuthenticated: (token: string) => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  accessToken: null,
  logout: () => {},
  setAuthenticated: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [auth, setAuth] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    setAccessToken(token)
    setAuth(!!token)
  }, [])

  const handleLogout = () => {
    logout()
    setAccessToken(null)
    setAuth(false)
  }

  const setAuthenticated = (token: string) => {
    setAccessToken(token)
    setAuth(!!token)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: auth, accessToken, logout: handleLogout, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
} 