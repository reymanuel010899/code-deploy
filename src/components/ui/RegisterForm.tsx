import { useState } from "react"
import { Input } from "./input"
import { Button } from "./button"
import { Label } from "./label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card"
import { register } from "@/providers/auth/sign-in"

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      await register({ username, password, email })
      setSuccess("Usuario registrado correctamente. Ahora puedes iniciar sesión.")
      setLoading(false)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto mt-10 animate-fade-in">
      <CardHeader>
        <CardTitle>Registrarse</CardTitle>
        <CardDescription>Crea una cuenta nueva para empezar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Usuario</Label>
            <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 