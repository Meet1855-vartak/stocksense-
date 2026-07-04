import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/stock-entry', label: 'Add Stock', icon: '📸' },
  { to: '/sales', label: 'Record Sale', icon: '🧾' },
  { to: '/analytics', label: 'Analytics', icon: '📊' },
  { to: '/insights', label: 'AI Insights', icon: '🤖' },
  { to: '/reports', label: 'Reports', icon: '📧' },
]

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.activeLink : {}),
          })}
        >
          <span style={{ marginRight: '10px' }}>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </aside>
  )
}

const styles = {
  sidebar: {
    width: '220px',
    minHeight: 'calc(100vh - 58px)', // full height minus navbar
    background: '#fff',
    borderRight: '1px solid #e2e8f0',
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    color: '#475569',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'background 0.15s ease',
  },
  activeLink: {
    background: '#eef2ff',
    color: '#6366f1',
    fontWeight: 600,
  },
}