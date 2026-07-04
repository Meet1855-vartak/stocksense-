import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Dashboard() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Logged in as: {user?.email}</p>
      <Link to="/products">Manage Products</Link>
      <br />
      <Link to="/stock-entry">Add Stock</Link>
      <br />
      <Link to="/sales">Record Sale</Link>
      <br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}