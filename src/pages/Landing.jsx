import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef, useState } from 'react'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div style={styles.page}>
      <Hero user={user} />
      <Features />
      <HowItWorks />
      <CTA user={user} />
      <Footer />
    </div>
  )
}

function Hero({ user }) {
  return (
    <section style={styles.hero}>
      <div style={styles.heroGlow} />
      <span style={styles.badge}>✨ AI-Powered Inventory Management</span>
      <h1 style={styles.heroTitle}>
        Run your shop smarter with <span style={styles.highlight}>AI-powered</span> inventory
      </h1>
      <p style={styles.heroSubtitle}>
        StockSense uses AI vision to scan shelves and receipts, tracks stock in real time,
        and tells you exactly what to reorder — before you run out.
      </p>
      <div style={styles.heroButtons}>
        {user ? (
          <Link to="/dashboard" style={styles.primaryBtn}>Go to Dashboard →</Link>
        ) : (
          <Link to="/signup" style={styles.primaryBtn}>Get Started Free →</Link>
        )}
        <Link to="/contact" style={styles.secondaryBtn}>Contact Us</Link>
      </div>

      <div style={styles.previewCard}>
        <div style={styles.previewDot} />
        <div style={{ ...styles.previewDot, background: 'var(--warning)' }} />
        <div style={{ ...styles.previewDot, background: 'var(--success)' }} />
        <span style={{ marginLeft: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          stocksense.app/dashboard
        </span>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { icon: '📸', title: 'Snap & Stock', desc: 'Photograph your shelf and let AI Vision detect products and quantities automatically.' },
    { icon: '🧾', title: 'Scan Receipts', desc: 'Snap a sales receipt and AI extracts items, quantities, and prices — no manual typing.' },
    { icon: '🤖', title: 'Ask AI Anything', desc: 'Get instant answers about what\'s selling, what\'s low, and what to reorder next.' },
    { icon: '📊', title: 'Live Analytics', desc: 'Visual dashboards showing revenue trends, best sellers, and stock health at a glance.' },
    { icon: '📧', title: 'Smart Alerts', desc: 'Automatic low-stock email alerts so you never run out of your best-selling items.' },
    { icon: '🔒', title: 'Secure & Private', desc: 'Your data is yours alone — protected with row-level security and secure authentication.' },
  ]

  return (
    <section style={styles.features}>
      <RevealOnScroll>
        <h2 style={styles.sectionTitle}>Everything a small shop needs</h2>
        <p style={styles.sectionSubtitle}>Powerful tools, wrapped in a simple interface</p>
      </RevealOnScroll>
      <div style={styles.featureGrid}>
        {features.map((f, i) => (
          <RevealOnScroll key={f.title} delay={i * 80}>
            <FeatureCard {...f} />
          </RevealOnScroll>
        ))}
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, desc }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      style={{ ...styles.featureCard, ...(hover ? styles.featureCardHover : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={styles.featureIcon}>{icon}</div>
      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureDesc}>{desc}</p>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    { number: '1', title: 'Add your products', desc: 'Set up your inventory once — name, price, stock, and reorder level.' },
    { number: '2', title: 'Scan to update', desc: 'Use your phone camera to scan shelves or receipts — AI does the data entry.' },
    { number: '3', title: 'Track & grow', desc: 'Watch your analytics dashboard and let AI insights guide your next move.' },
  ]

  return (
    <section style={styles.howItWorks}>
      <RevealOnScroll>
        <h2 style={styles.sectionTitle}>How it works</h2>
      </RevealOnScroll>
      <div style={styles.stepsGrid}>
        {steps.map((s, i) => (
          <RevealOnScroll key={s.number} delay={i * 100}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>{s.number}</div>
              <h3 style={{ margin: '14px 0 6px', color: 'var(--text)' }}>{s.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{s.desc}</p>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  )
}

function CTA({ user }) {
  return (
    <section style={styles.cta}>
      <RevealOnScroll>
        <h2 style={{ color: '#fff', marginBottom: '10px', fontSize: '1.8rem' }}>Ready to simplify your inventory?</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>Join StockSense today — it's free to get started.</p>
        {user ? (
          <Link to="/dashboard" style={styles.primaryBtnLight}>Go to Dashboard</Link>
        ) : (
          <Link to="/signup" style={styles.primaryBtnLight}>Create Free Account</Link>
        )}
      </RevealOnScroll>
    </section>
  )
}

function Footer() {
  return (
    <footer style={styles.footer}>
      <p>© 2026 StockSense. Built by Meet Vartak.</p>
      <Link to="/contact" style={{ color: '#94a3b8' }}>Contact</Link>
    </footer>
  )
}

// Scroll-reveal wrapper — fades + slides content up as it enters viewport
function RevealOnScroll({ children, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

const styles = {
  page: { fontFamily: 'inherit', overflow: 'hidden' },
  hero: {
    position: 'relative',
    textAlign: 'center',
    padding: '100px 20px 60px',
    background: 'var(--bg)',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: '-200px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '800px',
    height: '500px',
    background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
    opacity: 0.15,
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  badge: {
    display: 'inline-block',
    background: 'var(--primary-soft)',
    color: 'var(--primary)',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '24px',
    position: 'relative',
  },
  heroTitle: {
    fontSize: '2.8rem',
    fontWeight: 800,
    maxWidth: '780px',
    margin: '0 auto 20px',
    lineHeight: 1.25,
    color: 'var(--text)',
    position: 'relative',
  },
  highlight: { color: 'var(--primary)' },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: 'var(--text-muted)',
    maxWidth: '600px',
    margin: '0 auto 34px',
    position: 'relative',
  },
  heroButtons: { display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', marginBottom: '50px' },
  primaryBtn: {
    background: 'var(--primary)',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 600,
    boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
    transition: 'transform 0.15s ease',
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
    background: 'var(--bg-elevated)',
    color: 'var(--text)',
    padding: '14px 28px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 600,
    border: '1px solid var(--border)',
  },
  previewCard: {
    maxWidth: '600px',
    margin: '0 auto',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: 'var(--shadow)',
    position: 'relative',
  },
  previewDot: { width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger)' },
  features: { padding: '80px 30px', maxWidth: '1100px', margin: '0 auto' },
  sectionTitle: { textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text)' },
  sectionSubtitle: { textAlign: 'center', color: 'var(--text-muted)', marginBottom: '44px' },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    background: 'var(--bg-elevated)',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: 'var(--shadow)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    border: '1px solid transparent',
  },
  featureCardHover: {
    transform: 'translateY(-6px)',
    boxShadow: '0 12px 30px rgba(99,102,241,0.15)',
    border: '1px solid var(--primary)',
  },
  featureIcon: { fontSize: '2rem', marginBottom: '12px' },
  featureTitle: { fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' },
  featureDesc: { color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 },
  howItWorks: { background: 'var(--bg-elevated)', padding: '80px 30px' },
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
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    margin: '0 auto',
    fontSize: '1.1rem',
    boxShadow: '0 6px 18px rgba(99,102,241,0.4)',
  },
  cta: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    textAlign: 'center',
    padding: '80px 30px',
  },
  footer: {
    background: '#0f172a',
    color: '#94a3b8',
    textAlign: 'center',
    padding: '24px',
    fontSize: '0.9rem',
    borderTop: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
}