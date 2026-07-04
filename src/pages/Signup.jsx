import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signUp(email, password)
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.subtitle}>Start managing your inventory smarter</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.primaryBtn}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 58px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '20px',
  },
  card: {
    background: 'var(--bg-elevated)',
    borderRadius: '18px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: 'var(--shadow)',
  },
  title: { fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text)', textAlign: 'center' },
  subtitle: { color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  input: { width: '100%' },
  primaryBtn: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '1rem',
    marginTop: '6px',
  },
  error: { color: 'var(--danger)', fontSize: '0.9rem', margin: 0 },
  footerText: { textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' },
  link: { color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' },
}