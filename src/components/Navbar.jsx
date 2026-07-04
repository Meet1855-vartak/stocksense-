import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>📦 StockSense</Link>

      <div style={styles.right}>
        <Link to="/contact" style={styles.link}>Contact</Link>

        <button onClick={toggleTheme} style={styles.themeBtn} title="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {user ? (
          <>
            <span style={styles.userEmail}>{user.email}</span>
            {location.pathname === '/' ? (
              <Link to="/dashboard" style={styles.primaryBtn}>Go to Dashboard</Link>
            ) : (
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            )}
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/signup" style={styles.primaryBtn}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 30px',
    background: 'var(--nav-bg)',
    color: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  },
  logo: { color: '#fff', fontWeight: 700, fontSize: '1.2rem', textDecoration: 'none' },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  themeBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '1rem',
    color: '#fff',
  },
  userEmail: { color: 'var(--nav-text)', fontSize: '0.9rem' },
  link: { color: 'var(--nav-text)', textDecoration: 'none', fontSize: '0.95rem' },
  primaryBtn: {
    background: 'var(--primary)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 500,
    border: 'none',
  },
  logoutBtn: {
    background: 'var(--danger)',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
  },
}