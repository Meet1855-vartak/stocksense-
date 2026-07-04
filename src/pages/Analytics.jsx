import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#ec4899']

export default function Analytics() {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, category, price, quantity, reorder_threshold')

      const { data: salesData } = await supabase
        .from('sales')
        .select('id, total_amount, created_at, sale_items(quantity, price, product_id, products(name, category))')
        .order('created_at', { ascending: true })

      setProducts(productsData || [])
      setSales(salesData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p>Loading analytics...</p>
      </div>
    )
  }

  const stockData = products.map((p) => ({
    name: p.name,
    quantity: p.quantity,
    threshold: p.reorder_threshold,
  }))

  const itemSales = {}
  sales.forEach((s) => {
    s.sale_items.forEach((si) => {
      const name = si.products?.name || 'Unknown'
      itemSales[name] = (itemSales[name] || 0) + si.quantity
    })
  })
  const sellerData = Object.entries(itemSales).map(([name, qty]) => ({ name, quantity: qty }))
  const bestSellers = [...sellerData].sort((a, b) => b.quantity - a.quantity).slice(0, 5)
  const worstSellers = [...sellerData].sort((a, b) => a.quantity - b.quantity).slice(0, 5)

  const revenueByDate = {}
  sales.forEach((s) => {
    const date = new Date(s.created_at).toLocaleDateString()
    revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(s.total_amount)
  })
  const revenueTrend = Object.entries(revenueByDate).map(([date, amount]) => ({ date, amount }))

  const revenueByCategory = {}
  sales.forEach((s) => {
    s.sale_items.forEach((si) => {
      const category = si.products?.category || 'Uncategorized'
      revenueByCategory[category] = (revenueByCategory[category] || 0) + si.quantity * si.price
    })
  })
  const categoryData = Object.entries(revenueByCategory).map(([name, value]) => ({ name, value }))

  const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0)
  const totalSales = sales.length
  const lowStockCount = products.filter((p) => p.quantity <= p.reorder_threshold).length
  const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Analytics Dashboard</h1>
        <p style={styles.subtitle}>Real-time overview of your shop's performance</p>
      </div>

      {/* Summary cards */}
      <div style={styles.cardGrid}>
        <SummaryCard label="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} icon="💰" color="#6366f1" />
        <SummaryCard label="Total Sales" value={totalSales} icon="🧾" color="#22c55e" />
        <SummaryCard label="Avg. Sale Value" value={`₹${avgSale.toFixed(2)}`} icon="📈" color="#f59e0b" />
        <SummaryCard
          label="Low Stock Items"
          value={lowStockCount}
          icon="⚠️"
          color={lowStockCount > 0 ? '#ef4444' : '#22c55e'}
        />
      </div>

      {/* Stock levels */}
      <ChartCard title="📦 Stock Levels vs Reorder Threshold">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={stockData} barGap={4}>
            <defs>
              <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="threshGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={styles.tooltip} />
            <Legend />
            <Bar dataKey="quantity" fill="url(#stockGrad)" name="Current Stock" radius={[6, 6, 0, 0]} />
            <Bar dataKey="threshold" fill="url(#threshGrad)" name="Reorder Threshold" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Revenue trend */}
      <ChartCard title="📈 Revenue Over Time">
        {revenueTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={styles.tooltip} />
              <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={3} fill="url(#revGrad)" name="Revenue (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="No sales data yet" />
        )}
      </ChartCard>

      <div style={styles.twoCol}>
        {/* Best sellers */}
        <ChartCard title="🏆 Top 5 Best Sellers">
          {bestSellers.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bestSellers} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={styles.tooltip} />
                <Bar dataKey="quantity" name="Units Sold" radius={[0, 6, 6, 0]}>
                  {bestSellers.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="No sales data yet" />
          )}
        </ChartCard>

        {/* Worst sellers */}
        <ChartCard title="🐌 Bottom 5 Sellers">
          {worstSellers.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={worstSellers} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={styles.tooltip} />
                <Bar dataKey="quantity" fill="#f59e0b" name="Units Sold" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="No sales data yet" />
          )}
        </ChartCard>
      </div>

      {/* Revenue by category */}
      <ChartCard title="🥧 Revenue by Category">
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={styles.tooltip} formatter={(value) => `₹${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="No sales data yet" />
        )}
      </ChartCard>
    </div>
  )
}

function SummaryCard({ label, value, icon, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={styles.cardTop}>
        <span style={styles.cardIcon}>{icon}</span>
        <span style={styles.cardLabel}>{label}</span>
      </div>
      <p style={{ ...styles.cardValue, color }}>{value}</p>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div style={styles.chartCard}>
      <h2 style={styles.chartTitle}>{title}</h2>
      {children}
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div style={styles.empty}>
      <p>{text}</p>
    </div>
  )
}

const styles = {
  page: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'system-ui, sans-serif',
  },
  header: { marginBottom: '30px' },
  title: { fontSize: '2rem', margin: 0, fontWeight: 700 },
  subtitle: { color: '#888', marginTop: '4px' },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '35px',
  },
  card: {
    background: '#fff',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s ease',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
  cardIcon: { fontSize: '1.3rem' },
  cardLabel: { color: '#666', fontSize: '0.9rem', fontWeight: 500 },
  cardValue: { fontSize: '1.8rem', fontWeight: 700, margin: 0 },
  chartCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    marginBottom: '30px',
  },
  chartTitle: { fontSize: '1.2rem', marginBottom: '15px', fontWeight: 600 },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px',
  },
  tooltip: {
    borderRadius: '10px',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#aaa',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: '15px',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '4px solid #eee',
    borderTop: '4px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
}