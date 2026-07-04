import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/AppLayout'

const OWNER_EMAIL = 'meetvartak@proton.me'

function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setStatus('')
    setIsError(false)

    const html = `
      <h2>New Contact Message — StockSense</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ to: OWNER_EMAIL, subject: `New message from ${name} — StockSense Contact Form`, html }),
      })
      const result = await res.json()
      if (result.error) {
        setIsError(true)
        setStatus('Failed to send: ' + result.error)
      } else {
        setStatus('Message sent successfully!')
        setName(''); setEmail(''); setMessage('')
      }
    } catch (err) {
      setIsError(true)
      setStatus('Failed to send: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>Contact Us</h1>
      <p style={styles.subtitle}>Have a question or feedback about StockSense? Send us a message.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input style={styles.input} type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <textarea style={{ ...styles.input, resize: 'vertical' }} placeholder="Your message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
        <button type="submit" disabled={sending} style={styles.primaryBtn}>
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {status && <p style={isError ? styles.error : styles.success}>{status}</p>}
    </div>
  )
}

export default function Contact() {
  const { user } = useAuth()

  if (user) {
    // Logged in: show inside the sidebar layout
    return (
      <AppLayout>
        <ContactForm />
      </AppLayout>
    )
  }

  // Logged out: standalone page with a back link
  return (
    <div style={styles.page}>
      <Link to="/" style={styles.backLink}>← Back to Home</Link>
      <ContactForm />
    </div>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 58px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '40px 20px',
    position: 'relative',
  },
  backLink: {
    position: 'absolute',
    top: '24px',
    left: '30px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  card: {
    background: 'var(--bg-elevated)',
    borderRadius: '18px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: 'var(--shadow)',
    margin: '0 auto',
  },
  title: { fontSize: '1.7rem', fontWeight: 700, margin: 0, color: 'var(--text)', textAlign: 'center' },
  subtitle: { color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px', marginBottom: '26px' },
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
    marginTop: '4px',
  },
  error: { color: 'var(--danger)', textAlign: 'center', marginTop: '16px' },
  success: { color: 'var(--success)', textAlign: 'center', marginTop: '16px' },
}