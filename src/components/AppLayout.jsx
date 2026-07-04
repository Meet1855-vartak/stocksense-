import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '30px', background: '#f8fafc', minHeight: 'calc(100vh - 58px)' }}>
        {children}
      </main>
    </div>
  )
}