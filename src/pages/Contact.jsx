import { useState } from 'react'
import { supabase } from '../lib/supabase'

const OWNER_EMAIL = 'meetvartak@proton.me' // your email — receives contact form messages

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setStatus('')

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

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            to: OWNER_EMAIL,
            subject: `New message from ${name} — StockSense Contact Form`,
            html,
          }),
        }
      )
      const result = await res.json()
      if (result.error) {
        setStatus('Failed to send: ' + result.error)
      } else {
        setStatus('Message sent successfully!')
        setName(''); setEmail(''); setMessage('')
      }
    } catch (err) {
      setStatus('Failed to send: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h1>Contact Us</h1>
      <p>Have a question or feedback about StockSense? Send us a message.</p>
      <form onSubmit={handleSubmit}>
        <input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <textarea placeholder="Your message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
        <button type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send Message'}</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  )
}