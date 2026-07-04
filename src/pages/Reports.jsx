import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Reports() {
  const { user } = useAuth()
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('')

  const handleSendSummary = async () => {
    setSending(true)
    setStatus('')

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
      const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      const html = `
        <h2>Weekly Sales Summary — StockSense</h2>
        <p><strong>Period:</strong> Last 7 days</p>
        <p><strong>Total Sales:</strong> ${totalSalesCount}</p>
        <p><strong>Total Revenue:</strong> ₹${totalRevenue.toFixed(2)}</p>
        <h3>Top Selling Items:</h3>
        <ul>
          ${topItems.map(([name, qty]) => `<li>${name}: ${qty} units sold</li>`).join('')}
        </ul>
      `

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session.access_token

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: user.email,
          subject: 'Your Weekly Sales Summary — StockSense',
          html,
        }),
      })

      const result = await res.json()
      if (result.error || result.statusCode >= 400) {
        setStatus('Failed to send summary.')
      } else {
        setStatus('Summary email sent successfully!')
      }
    } catch (err) {
      setStatus('Failed: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h1>Reports</h1>
      <p>Generate and email yourself a summary of the last 7 days of sales.</p>
      <button onClick={handleSendSummary} disabled={sending}>
        {sending ? 'Sending...' : 'Send Summary Now'}
      </button>
      {status && <p>{status}</p>}
    </div>
  )
}