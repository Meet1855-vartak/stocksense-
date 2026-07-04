import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Reports() {
  const { user } = useAuth()
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('')
  const [isError, setIsError] = useState(false)

  const handleSendSummary = async () => {
    setSending(true)
    setStatus('')
    setIsError(false)

    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: sales } = await supabase
        .from('sales')
        .select('total_amount, created_at, sale_items(quantity, products(name))')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })

      const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0)
      const totalSalesCount = sales.length

      const itemCounts = {}
      sales.forEach((s) => {
        s.sale_items.forEach((si) => {
          const name = si.products?.name || 'Unknown'
          itemCounts[name] = (itemCounts[name] || 0) + si.quantity
        })
      })
      const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

      const html = `
        <h2>Weekly Sales Summary — StockSense</h2>
        <p><strong>Period:</strong> Last 7 days</p>
        <p><strong>Total Sales:</strong> ${totalSalesCount}</p>
        <p><strong>Total Revenue:</strong> ₹${totalRevenue.toFixed(2)}</p>
        <h3>Top Selling Items:</h3>
        <ul>${topItems.map(([name, qty]) => `<li>${name}: ${qty} units sold</li>`).join('')}</ul>
      `

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session.access_token

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: user.email, subject: 'Your Weekly Sales Summary — StockSense', html }),
      })

      const result = await res.json()
      if (result.error || result.statusCode >= 400) {
        setIsError(true)
        setStatus('Failed to send summary.')
      } else {
        setStatus('Summary email sent successfully!')
      }
    } catch (err) {
      setIsError(true)
      setStatus('Failed: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>📧 Reports</h1>
        <p style={styles.subtitle}>Generate and email yourself a summary of the last 7 days of sales</p>
      </div>

      <div style={styles.card}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Click below to compile your recent sales data and receive it by email — includes total revenue,
          number of sales, and top-selling items.
        </p>
        <button onClick={handleSendSummary} disabled={sending} style={styles.primaryBtn}>
          {sending ? 'Sending...' : '📤 Send Summary Now'}
        </button>
        {status && <p style={isError ? styles.error : styles.success}>{status}</p>}
      </div>
    </div>
  )
}

const styles = {
  header: { marginBottom: '24px' },
  title: { fontSize: '1.8rem', fontWeight: 700, margin: 0, color: 'var(--text)' },
  subtitle: { color: 'var(--text-muted)', marginTop: '4px' },
  card: {
    background: 'var(--bg-elevated)',
    borderRadius: '14px',
    padding: '26px',
    boxShadow: 'var(--shadow)',
    maxWidth: '600px',
  },
  primaryBtn: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 600,
  },
  error: { color: 'var(--danger)', marginTop: '16px' },
  success: { color: 'var(--success)', marginTop: '16px' },
}