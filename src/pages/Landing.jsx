import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div style={styles.page}>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Run your shop smarter with <span style={styles.highlight}>AI-powered</span> inventory
        </h1>
        <p style={styles.heroSubtitle}>
          StockSense uses AI vision to scan shelves and receipts, tracks stock in real time,
          and tells you exactly what to reorder — before you run out.
        </p>
        <div style={styles.heroButtons}>
          {user ? (
            <Link to="/dashboard" style={styles.primaryBtn}>Go to Dashboard</Link>
          ) : (
            <Link to="/signup" style={styles.primaryBtn}>Get Started Free</Link>
          )}
          <Link to="/contact" style={styles.secondaryBtn}>Contact Us</Link>
        </div>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Everything a small shop needs</h2>
        <div style={styles.featureGrid}>
          <FeatureCard
            icon="📸"
            title="Snap & Stock"
            desc="Photograph your shelf and let AI Vision detect products and quantities automatically."
          />
          <FeatureCard
            icon="🧾"
            title="Scan Receipts"
            desc="Snap a sales receipt and AI extracts items, quantities, and prices — no manual typing."
          />
          <FeatureCard
            icon="🤖"
            title="Ask AI Anything"
            desc="Get instant answers about what's selling, what's low, and what to reorder next."
          />
          <FeatureCard
            icon="📊"
            title="Live Analytics"
            desc="Visual dashboards showing revenue trends, best sellers, and stock health at a glance."
          />
          <FeatureCard
            icon="📧"
            title="Smart Alerts"
            desc="Automatic low-stock email alerts so you never run out of your best-selling items."
          />
          <FeatureCard
            icon="🔒"
            title="Secure & Private"
            desc="Your data is yours alone — protected with row-level security and secure authentication."
          />
        </div>
      </section>

      {/* How it works */}
      <section style={styles.howItWorks}>
        <h2 style={styles.sectionTitle}>How it works</h2>
        <div style={styles.stepsGrid}>
          <Step number="1" title="Add your products" desc="Set up your inventory once — name, price, stock, and reorder level." />
          <Step number="2" title="Scan to update" desc="Use your phone camera to scan shelves or receipts — AI does the data entry." />
          <Step number="3" title="Track & grow" desc="Watch your analytics dashboard and let AI insights guide your next move." />
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={{ color: '#fff', marginBottom: '10px' }}>Ready to simplify your inventory?</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>Join StockSense today — it's free to get started.</p>
        {user ? (
          <Link to="/dashboard" style={styles.primaryBtnLight}>Go to Dashboard</Link>
        ) : (
          <Link to="/signup" style={styles.primaryBtnLight}>Create Free Account</Link>
        )}
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 StockSense. Built by Meet Vartak.</p>
        <Link to="/contact" style={{ color: '#94a3b8' }}>Contact</Link>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={styles.featureCard}>
      <div style={styles.featureIcon}>{icon}</div>
      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureDesc}>{desc}</p>
    </div>
  )
}

function Step({ number, title, desc }) {
  return (
    <div style={styles.step}>
      <div style={styles.stepNumber}>{number}</div>
      <h3 style={{ margin: '10px 0 6px' }}>{title}</h3>
      <p style={{ color: '#666', fontSize: '0.95rem' }}>{desc}</p>
    </div>
  )
}

const styles = {
  page: { fontFamily: 'inherit' },
  hero: {
    textAlign: 'center',
    padding: '90px 20px 70px',
    background: 'linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%)',
  },
  heroTitle: {
    fontSize: '2.6rem',
    fontWeight: 800,
    maxWidth: '750px',
    margin: '0 auto 20px',
    lineHeight: 1.25,
  },
  highlight: { color: '#6366f1' },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: '#475569',
    maxWidth: '600px',
    margin: '0 auto 30px',
  },
  heroButtons: { display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: {
    background: '#6366f1',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 600,
    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
  },
  primaryBtnLight: {
    background: '#fff',
    color: '#0f172a',
    padding: '14px 28px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 600,
    display: 'inline-block',
  },
  secondaryBtn: {
    background: '#fff',
    color: '#0f172a',
    padding: '14px 28px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 600,
    border: '1px solid #cbd5e1',
  },
  features: { padding: '70px 30px', maxWidth: '1100px', margin: '0 auto' },
  sectionTitle: { textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '40px' },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  featureIcon: { fontSize: '2rem', marginBottom: '12px' },
  featureTitle: { fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' },
  featureDesc: { color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 },
  howItWorks: { background: '#fff', padding: '70px 30px' },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '30px',
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center',
  },
  step: { padding: '10px' },
  stepNumber: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: '#6366f1',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    margin: '0 auto',
    fontSize: '1.1rem',
  },
  cta: {
    background: '#0f172a',
    textAlign: 'center',
    padding: '70px 30px',
  },
  footer: {
    background: '#0f172a',
    color: '#94a3b8',
    textAlign: 'center',
    padding: '20px',
    fontSize: '0.9rem',
    borderTop: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
}