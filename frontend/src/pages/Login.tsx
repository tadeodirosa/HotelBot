import React, { useState } from 'react'
import { useAuthStore } from '../shared/store/useAuthStore.ts'
import { useNavigate } from 'react-router-dom'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-3xl font-bold text-gray-800">HotelBot</h1>
          <p className="text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              color: '#dc2626', 
              padding: '0.75rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <p className="text-gray-600" style={{ fontSize: '0.875rem' }}>
              ¿Olvidaste tu contraseña?{' '}
              <a href="#" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                Recuperar
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
