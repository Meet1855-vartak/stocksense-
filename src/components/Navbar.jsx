import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
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
            <Link to="/contact" style={styles.link}>Contact</Link>
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
    background: '#0f172a',
    color: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  },
  logo: { color: '#fff', fontWeight: 700, fontSize: '1.2rem', textDecoration: 'none' },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  userEmail: { color: '#94a3b8', fontSize: '0.9rem' },
  link: { color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem' },
  primaryBtn: {
    background: '#6366f1',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 500,
    border: 'none',
  },
  logoutBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
  },
}