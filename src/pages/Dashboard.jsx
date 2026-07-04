import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ products: 0, lowStock: 0, sales: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const { data: products } = await supabase.from('products').select('quantity, reorder_threshold')
      const { data: sales } = await supabase.from('sales').select('total_amount')

      const lowStock = (products || []).filter((p) => p.quantity <= p.reorder_threshold).length
      const revenue = (sales || []).reduce((sum, s) => sum + parseFloat(s.total_amount), 0)

      setStats({
        products: products?.length || 0,
        lowStock,
        sales: sales?.length || 0,
        revenue,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Welcome back 👋</h1>
        <p style={styles.subtitle}>{user?.email}</p>
      </div>

      <div style={styles.statsGrid}>
        <StatCard label="Total Products" value={loading ? '—' : stats.products} icon="📦" color="var(--primary)" />
        <StatCard label="Low Stock Alerts" value={loading ? '—' : stats.lowStock} icon="⚠️" color={stats.lowStock > 0 ? 'var(--danger)' : 'var(--success)'} />
        <StatCard label="Total Sales" value={loading ? '—' : stats.sales} icon="🧾" color="var(--warning)" />
        <StatCard label="Total Revenue" value={loading ? '—' : `₹${stats.revenue.toFixed(2)}`} icon="💰" color="var(--success)" />
      </div>

      <h2 style={styles.sectionTitle}>Quick Actions</h2>
      <div style={styles.actionsGrid}>
        <ActionCard to="/products" icon="📦" title="Manage Products" desc="Add, edit, or remove products from your inventory." />
        <ActionCard to="/stock-entry" icon="📸" title="Add Stock" desc="Scan a shelf photo or manually add new stock." />
        <ActionCard to="/sales" icon="🧾" title="Record a Sale" desc="Scan a receipt or manually log a sale." />
        <ActionCard to="/analytics" icon="📊" title="View Analytics" desc="See revenue trends, best sellers, and stock health." />
        <ActionCard to="/insights" icon="🤖" title="Ask AI" desc="Get instant insights about your shop's performance." />
        <ActionCard to="/reports" icon="📧" title="Send Reports" desc="Email yourself a weekly sales summary." />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <div style={styles.statTop}>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
        <span style={styles.statLabel}>{label}</span>
      </div>
      <p style={{ ...styles.statValue, color }}>{value}</p>
    </div>
  )
}

function ActionCard({ to, icon, title, desc }) {
  return (
    <Link to={to} style={styles.actionCard}>
      <div style={styles.actionIcon}>{icon}</div>
      <h3 style={styles.actionTitle}>{title}</h3>
      <p style={styles.actionDesc}>{desc}</p>
    </Link>
  )
}

const styles = {
  header: { marginBottom: '30px' },
  title: { fontSize: '1.8rem', fontWeight: 700, margin: 0, color: 'var(--text)' },
  subtitle: { color: 'var(--text-muted)', marginTop: '4px' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'var(--bg-elevated)',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: 'var(--shadow)',
  },
  statTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  statLabel: { color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 },
  statValue: { fontSize: '1.7rem', fontWeight: 700, margin: 0 },
  sectionTitle: { fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  actionCard: {
    background: 'var(--bg-elevated)',
    borderRadius: '14px',
    padding: '22px',
    textDecoration: 'none',
    color: 'var(--text)',
    boxShadow: 'var(--shadow)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    display: 'block',
  },
  actionIcon: { fontSize: '1.6rem', marginBottom: '10px' },
  actionTitle: { fontSize: '1.05rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--text)' },
  actionDesc: { color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.4 },
}