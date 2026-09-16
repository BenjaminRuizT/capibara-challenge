import { useState } from 'react'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPwd,  setShowPwd]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); return }
      onLogin(data)
    } catch { setError('Error de conexión') }
    finally  { setLoading(false) }
  }

  return (
    <div className="login-overlay">
      <div className="login-bg-shapes">
        <div className="login-shape s1" /><div className="login-shape s2" /><div className="login-shape s3" />
      </div>
      <div className="login-card">
        <div className="login-logo">🦦</div>
        <h1 className="login-title">Capibara's Challenge</h1>
        <p className="login-subtitle">Inicia sesión para continuar</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <span className="login-field-icon">👤</span>
            <input className="login-input" type="text" placeholder="Usuario" value={username}
              onChange={e => setUsername(e.target.value)} autoFocus autoComplete="username" required />
          </div>
          <div className="login-field">
            <span className="login-field-icon">🔒</span>
            <input className="login-input" type={showPwd ? 'text' : 'password'} placeholder="Contraseña" value={password}
              onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
            <button type="button" className="login-eye" onClick={() => setShowPwd(v => !v)}>{showPwd ? '🙈' : '👁'}</button>
          </div>
          {error && <div className="login-error">⚠ {error}</div>}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? <span className="login-spinner" /> : 'Entrar →'}
          </button>
        </form>
        <div className="login-hint">
          <span>Acceso de visitante:</span>
          <code>visitante / visitante</code>
        </div>
      </div>
    </div>
  )
}
