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
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question,
            context: { products, recent_sales: sales },
          }),
        }
      )

      const result = await res.json()
      if (result.error) {
        setError(result.error)
      } else {
        setAnswer(result.answer)
      }
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
      <h1>AI Insights</h1>
      <p>Ask questions about your inventory and sales in plain language.</p>

      <form onSubmit={handleAsk}>
        <input
          type="text"
          placeholder="Ask something, e.g. 'What should I reorder?'"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: '400px' }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      <div style={{ marginTop: '10px' }}>
        {quickQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setQuestion(q)}
            style={{ marginRight: '8px', marginBottom: '8px' }}
          >
            {q}
          </button>
        ))}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {answer && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#eef', borderRadius: '6px' }}>
          <strong>AI Insight:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  )
}