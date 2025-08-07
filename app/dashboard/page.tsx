"use client"
import { useAuth } from "@/providers/auth/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!isAuthenticated) router.replace("/sign-in")
  }, [isAuthenticated])
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4">Bienvenido al Dashboard</h1>
      <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  )
} 