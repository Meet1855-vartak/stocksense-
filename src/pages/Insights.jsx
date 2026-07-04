import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Insights() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])

  const fetchContext = async () => {
    const { data: productsData } = await supabase
      .from('products')
      .select('name, category, price, quantity, reorder_threshold')

    const { data: salesData } = await supabase
      .from('sales')
      .select('total_amount, created_at, sale_items(quantity, price, products(name))')
      .order('created_at', { ascending: false })
      .limit(50)

    setProducts(productsData || [])
    setSales(salesData || [])
  }

  useEffect(() => {
    fetchContext()
  }, [])

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setError('')
    setAnswer('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session.access_token

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ question, context: { products, recent_sales: sales } }),
        }
      )

      const result = await res.json()
      if (result.error) setError(result.error)
      else setAnswer(result.answer)
    } catch (err) {
      setError('Failed to get insight: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    'What sold best this month?',
    'Which products are low on stock?',
    'What should I reorder soon?',
    'What is my total revenue from recent sales?',
  ]

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>🤖 AI Insights</h1>
        <p style={styles.subtitle}>Ask questions about your inventory and sales in plain language</p>
      </div>

      <div style={styles.card}>
        <form onSubmit={handleAsk} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Ask something, e.g. 'What should I reorder?'"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" disabled={loading} style={styles.primaryBtn}>
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </form>

        <div style={styles.quickRow}>
          {quickQuestions.map((q) => (
            <button key={q} type="button" onClick={() => setQuestion(q)} style={styles.quickBtn}>
              {q}
            </button>
          ))}
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {answer && (
          <div style={styles.answerBox}>
            <strong style={{ color: 'var(--primary)' }}>AI Insight</strong>
            <p style={{ margin: '8px 0 0', color: 'var(--text)', lineHeight: 1.6 }}>{answer}</p>
          </div>
        )}
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
  },
  form: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  input: { flex: '1 1 300px' },
  primaryBtn: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '8px',
    fontWeight: 600,
  },
  quickRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' },
  quickBtn: {
    background: 'var(--primary-soft)',
    color: 'var(--primary)',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  error: { color: 'var(--danger)', marginTop: '16px' },
  answerBox: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px',
  },
}