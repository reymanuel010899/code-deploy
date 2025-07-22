import { useState } from "react"
import { Input } from "./input"
import { Button } from "./button"
import { Label } from "./label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card"
import { signIn, isAuthenticated } from "@/providers/auth/sign-in"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth/AuthProvider";
import { Loader2 } from "lucide-react";

export function SignInForm({ onSuccess, redirectTo = "/" }: { onSuccess?: () => void, redirectTo?: string }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { setAuthenticated, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [isAuthenticated, router])

  // Mostrar loader mientras se determina el estado de autenticación
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const data = await signIn({ username, password })
      setAuthenticated(data.access)
      setLoading(false)
      if (onSuccess) onSuccess()
      router.replace(redirectTo)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto mt-10 animate-fade-in">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>Accede a tu cuenta para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Usuario</Label>
            <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 