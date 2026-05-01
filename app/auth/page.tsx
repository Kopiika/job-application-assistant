'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.session) {
        router.push('/')
      } else {
        setMessage('Check your email to confirm your account.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 36px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h1
          className="font-serif"
          style={{ fontSize: 24, fontWeight: 500, margin: '0 0 4px', color: 'var(--text)' }}
        >
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 28px', fontSize: 14 }}>
          {mode === 'login'
            ? 'Sign in to your Job Assistant account.'
            : 'Start building your profile and tracking applications.'}
        </p>

        <button
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/auth/callback` },
            })
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '10px',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text)',
            background: 'var(--surface)',
            marginBottom: 20,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                padding: '9px 12px',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface)',
                fontSize: 14,
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              style={{
                padding: '9px 12px',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface)',
                fontSize: 14,
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          {error && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: 'var(--danger)',
                background: 'var(--danger-soft)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {error}
            </p>
          )}

          {message && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: 'var(--success)',
                background: 'var(--success-soft)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px',
              background: loading ? 'var(--border-strong)' : 'var(--accent)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', margin: '20px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError('')
              setMessage('')
            }}
            style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'underline' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
