import { useState, useEffect } from "react"
import { Input } from "./input"
import { Button } from "./button"
import { Label } from "./label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card"
import { Loader2, Cloud, Zap, Shield, Eye, EyeOff, Sparkles, Server, Database, Cpu, HardDrive, Network, Lock, Key, Users, Activity, Wifi, BarChart3, Settings, Terminal, Code, GitBranch, Package, Layers, Monitor, Smartphone, Laptop, Router, Satellite } from "lucide-react";
import { signIn } from "../../providers/auth/sign-in"

export function SignInForm({ onSuccess, redirectTo = "/" }: { onSuccess?: () => void, redirectTo?: string }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState({ username: false, password: false })
  const [currentCloud, setCurrentCloud] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const clouds = [
    { name: "AWS", color: "from-orange-500 to-red-600", services: ["EC2", "Lambda", "S3"] },
    { name: "Azure", color: "from-blue-500 to-cyan-600", services: ["VM", "Functions", "Blob"] },
    { name: "Google Cloud", color: "from-green-500 to-blue-600", services: ["Compute", "Cloud Functions", "Storage"] }
  ]

  const infrastructureElements = [
    { icon: Server, color: "blue", position: "top-1/3 left-1/6", animation: "pulse" },
    { icon: Database, color: "green", position: "top-2/3 right-1/6", animation: "bounce" },
    { icon: Cpu, color: "purple", position: "bottom-1/3 left-1/3", animation: "ping" },
    { icon: HardDrive, color: "yellow", position: "top-1/2 right-1/4", animation: "spin-slow" },
    { icon: Network, color: "cyan", position: "bottom-1/4 left-1/2", animation: "float-medium" },
    { icon: Router, color: "orange", position: "top-1/4 right-1/3", animation: "pulse" },
    { icon: Satellite, color: "pink", position: "bottom-1/6 right-1/3", animation: "bounce" },
    { icon: Wifi, color: "indigo", position: "top-3/4 left-1/4", animation: "ping" },
    { icon: Monitor, color: "teal", position: "bottom-1/3 right-1/4", animation: "float-slow" },
    { icon: Smartphone, color: "emerald", position: "top-1/6 left-1/3", animation: "pulse" },
    { icon: Laptop, color: "violet", position: "bottom-1/4 right-1/6", animation: "bounce" },
    { icon: Terminal, color: "amber", position: "top-2/3 left-1/4", animation: "spin-slow" },
    { icon: Code, color: "rose", position: "bottom-1/6 left-1/4", animation: "ping" },
    { icon: GitBranch, color: "sky", position: "top-1/2 left-1/6", animation: "float-medium" },
    { icon: Package, color: "lime", position: "bottom-1/3 left-1/6", animation: "pulse" },
    { icon: Layers, color: "fuchsia", position: "top-3/4 right-1/6", animation: "bounce" },
    { icon: BarChart3, color: "slate", position: "bottom-1/2 right-1/3", animation: "ping" },
    { icon: Settings, color: "stone", position: "top-1/4 left-1/2", animation: "spin-slow" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCloud((prev) => (prev + 1) % clouds.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      console.log("Intentando login con:", { username, password })
      const result = await signIn({ username, password })
      console.log("Login exitoso:", result)
      if (onSuccess) onSuccess()
      window.location.href = redirectTo
    } catch (error: any) {
      console.error("Error en login:", error)
      if (error.message) {
        setError(error.message)
      } else if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError("Credenciales incorrectas")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Mouse Follow Effect */}
      <div 
        className="fixed w-4 h-4 bg-cyan-400/30 rounded-full pointer-events-none z-50 transition-transform duration-100 ease-out"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          transform: isHovering ? 'scale(2)' : 'scale(1)'
        }}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Clouds with Cloud Providers */}
        <div className="absolute top-20 left-10 animate-float-slow">
          <div className="relative">
            <Cloud className="text-white/10 h-16 w-16" />
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white/20 font-bold">AWS</span>
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-float-medium">
          <div className="relative">
            <Cloud className="text-white/5 h-20 w-20" />
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white/10 font-bold">AZURE</span>
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float-fast">
          <div className="relative">
            <Cloud className="text-white/8 h-12 w-12" />
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white/15 font-bold">GCP</span>
          </div>
        </div>
        
        {/* Dynamic Infrastructure Elements */}
        {infrastructureElements.map((element, index) => {
          const IconComponent = element.icon
          return (
            <div key={index} className={`absolute ${element.position} animate-${element.animation}`}>
              <IconComponent className={`text-${element.color}-400/30 h-6 w-6`} />
            </div>
          )
        })}
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/6 right-1/6 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/6 left-1/6 w-2.5 h-2.5 bg-orange-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/2 right-1/2 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-3/4 right-1/3 w-1 h-1 bg-emerald-400 rounded-full animate-bounce"></div>

        {/* Data Flow Lines */}
        <div className="absolute top-1/4 left-1/3 w-20 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent animate-pulse"></div>
        <div className="absolute bottom-1/2 left-1/2 w-18 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent animate-pulse"></div>
        <div className="absolute top-2/3 left-1/6 w-14 h-px bg-gradient-to-r from-transparent via-pink-400/50 to-transparent animate-pulse"></div>

        {/* Security Elements */}
        <div className="absolute top-1/6 left-1/2 animate-bounce">
          <Lock className="text-green-400/40 h-4 w-4" />
        </div>
        <div className="absolute bottom-1/6 right-1/2 animate-pulse">
          <Key className="text-yellow-400/40 h-4 w-4" />
        </div>
        <div className="absolute top-2/3 left-1/6 animate-ping">
          <Shield className="text-blue-400/40 h-5 w-5" />
        </div>
        <div className="absolute bottom-1/3 right-1/6 animate-bounce">
          <Lock className="text-purple-400/40 h-4 w-4" />
        </div>
        <div className="absolute top-1/2 left-1/6 animate-pulse">
          <Shield className="text-cyan-400/40 h-4 w-4" />
        </div>

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
              <stop offset="50%" stopColor="rgba(168, 85, 247, 0.3)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
            </linearGradient>
          </defs>
          <line x1="20%" y1="30%" x2="40%" y2="50%" stroke="url(#connectionGradient)" strokeWidth="1" className="animate-pulse" />
          <line x1="60%" y1="20%" x2="80%" y2="40%" stroke="url(#connectionGradient)" strokeWidth="1" className="animate-pulse" />
          <line x1="30%" y1="70%" x2="70%" y2="80%" stroke="url(#connectionGradient)" strokeWidth="1" className="animate-pulse" />
          <line x1="10%" y1="60%" x2="50%" y2="30%" stroke="url(#connectionGradient)" strokeWidth="1" className="animate-pulse" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Cloud className="h-12 w-12 text-cyan-400 animate-bounce" />
                <Zap className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                <Activity className="h-4 w-4 text-green-400 absolute -bottom-1 -left-1 animate-ping" />
                <Wifi className="h-3 w-3 text-purple-400 absolute -top-1 -left-1 animate-bounce" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2 animate-pulse">
              CloudDeploy
            </h1>
            <p className="text-gray-300 text-lg mb-4">Tu puerta de entrada al mundo serverless</p>
            
            {/* Cloud Provider Indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex space-x-2">
                {clouds.map((cloud, index) => (
                  <div
                    key={cloud.name}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      index === currentCloud 
                        ? `bg-gradient-to-r ${cloud.color} animate-pulse` 
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm ml-2">
                {clouds[currentCloud].name}
              </span>
            </div>

            {/* Services Indicator */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {clouds[currentCloud].services.map((service, index) => (
                <span 
                  key={service}
                  className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Login Card */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl relative overflow-hidden"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}>
            {/* Card Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-blue-500/5 animate-pulse"></div>
            
            {/* Card Border Glow */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-blue-400/20 animate-pulse opacity-50"></div>
            
            <CardHeader className="text-center pb-6 relative z-10">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-cyan-400 animate-pulse" />
                Iniciar Sesión
                <Users className="h-5 w-5 text-purple-400 animate-bounce" />
              </CardTitle>
              <CardDescription className="text-gray-300">
                Accede a tu cuenta para desplegar en la nube
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="relative group">
                  <Label htmlFor="username" className="text-gray-300 text-sm font-medium mb-2 block flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-400" />
                    Usuario
                  </Label>
                  <div className="relative">
                    <Input 
                      id="username" 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      onFocus={() => setIsFocused({ ...isFocused, username: true })}
                      onBlur={() => setIsFocused({ ...isFocused, username: false })}
                      required 
                      autoFocus
                      className={`bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300 ${
                        isFocused.username ? 'scale-105 shadow-lg shadow-cyan-400/20' : ''
                      }`}
                      placeholder="Ingresa tu usuario"
                    />
                    {isFocused.username && (
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-cyan-400/20 to-purple-400/20 animate-pulse pointer-events-none"></div>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="relative group">
                  <Label htmlFor="password" className="text-gray-300 text-sm font-medium mb-2 block flex items-center gap-2">
                    <Lock className="h-4 w-4 text-purple-400" />
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      onFocus={() => setIsFocused({ ...isFocused, password: true })}
                      onBlur={() => setIsFocused({ ...isFocused, password: false })}
                      required
                      className={`bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300 pr-12 ${
                        isFocused.password ? 'scale-105 shadow-lg shadow-cyan-400/20' : ''
                      }`}
                      placeholder="Ingresa tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {isFocused.password && (
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-cyan-400/20 to-purple-400/20 animate-pulse pointer-events-none"></div>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm animate-shake flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden" 
                  disabled={loading}
                >
                  {/* Button Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Conectando a la nube...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <Sparkles className="h-5 w-5" />
                      <span>Iniciar Sesión</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Additional Info */}
              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  ¿No tienes cuenta? 
                  <a href="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors ml-1">
                    Regístrate aquí
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer with Infrastructure Info */}
          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-4 mb-2 flex-wrap">
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Server className="h-3 w-3" />
                <span>Servidores</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Database className="h-3 w-3" />
                <span>Bases de Datos</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Network className="h-3 w-3" />
                <span>Redes</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Cpu className="h-3 w-3" />
                <span>Procesamiento</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Wifi className="h-3 w-3" />
                <span>Conectividad</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Despliega tu código en la nube con facilidad
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 