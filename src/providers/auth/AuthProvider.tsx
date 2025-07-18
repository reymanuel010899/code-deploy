"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { getAccessToken, isAuthenticated, logout } from "./sign-in"

interface AuthContextType {
  isAuthenticated: boolean
  accessToken: string | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  accessToken: null,
  logout: () => {},
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

  return (
    <AuthContext.Provider value={{ isAuthenticated: auth, accessToken, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
} 