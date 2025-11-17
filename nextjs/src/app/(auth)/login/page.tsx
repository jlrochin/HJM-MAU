'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { User, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/mau/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full bg-background border-b border-border">
        <div className="w-full h-16 px-6 flex items-center relative">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 bg-foreground"
              style={{
                WebkitMaskImage: 'url(/mau/logo-hjm.svg)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/mau/logo-hjm.svg)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
            />
            <div className="h-8 w-px bg-border rounded-full" />
          </div>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-semibold text-foreground">Hospital Juárez de México</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="h-8 w-px bg-border rounded-full" />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow-lg border border-border">
          <div>
            <h2 className="text-center text-3xl font-bold text-foreground">
              Módulo de Atención al Usuario
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Sistema de Gestión de Recetas
            </p>
          </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground">
                Usuario
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-foreground" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-input rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-foreground hover:text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-foreground hover:text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Usuarios de prueba:</p>
            <p>admin / admin123</p>
            <p>doctor1 / admin123</p>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}
