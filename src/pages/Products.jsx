import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [reorderThreshold, setReorderThreshold] = useState('')
  const [editingId, setEditingId] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const resetForm = () => {
    setName('')
    setCategory('')
    setPrice('')
    setQuantity('')
    setReorderThreshold('')
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const payload = {
      name,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      reorder_threshold: parseInt(reorderThreshold) || 5,
    }

    let result
    if (editingId) {
      result = await supabase.from('products').update(payload).eq('id', editingId)
    } else {
      const { data: userData } = await supabase.auth.getUser()
      result = await supabase.from('products').insert({ ...payload, user_id: userData.user.id })
    }

    if (result.error) {
      setError(result.error.message)
    } else {
      resetForm()
      fetchProducts()
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setName(product.name)
    setCategory(product.category || '')
    setPrice(product.price)
    setQuantity(product.quantity)
    setReorderThreshold(product.reorder_threshold)
  }

 const handleDelete = async (id) => {
  if (!confirm('Delete this product?')) return
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) {
    if (error.message.includes('foreign key constraint')) {
      setError('This product has sales history and cannot be deleted. Consider setting its quantity to 0 instead.')
    } else {
      setError(error.message)
    }
  } else {
    fetchProducts()
  }
}

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Products</h1>
        <p style={styles.subtitle}>Manage your inventory items</p>
      </div>

      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input style={styles.input} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <input style={styles.input} type="number" step="0.01" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
          <input style={styles.input} type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          <input style={styles.input} type="number" placeholder="Reorder Threshold" value={reorderThreshold} onChange={(e) => setReorderThreshold(e.target.value)} />
          <div style={styles.formButtons}>
            <button type="submit" style={styles.primaryBtn}>{editingId ? 'Update' : 'Add'} Product</button>
            {editingId && <button type="button" onClick={resetForm} style={styles.secondaryBtn}>Cancel</button>}
          </div>
        </form>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Reorder At</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={p.quantity <= p.reorder_threshold ? styles.lowStockRow : {}}>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={styles.td}>₹{p.price}</td>
                  <td style={styles.td}>{p.quantity}</td>
                  <td style={styles.td}>{p.reorder_threshold}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleEdit(p)} style={styles.editBtn}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="6" style={styles.emptyCell}>No products yet — add your first one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const styles = {
  header: { marginBottom: '24px' },
  title: { fontSize: '1.8rem', fontWeight: 700, margin: 0, color: 'var(--text)' },
  subtitle: { color: 'var(--text-muted)', marginTop: '4px' },
  formCard: {
    background: 'var(--bg-elevated)',
    borderRadius: '14px',
    padding: '22px',
    boxShadow: 'var(--shadow)',
    marginBottom: '30px',
  },
  formTitle: { margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text)' },
  form: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  input: { minWidth: '140px', flex: '1 1 140px' },
  formButtons: { display: 'flex', gap: '10px' },
  primaryBtn: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 600,
  },
  secondaryBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 500,
  },
  error: { color: 'var(--danger)', marginBottom: '16px' },
  tableCard: {
    background: 'var(--bg-elevated)',
    borderRadius: '14px',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: 600,
    borderBottom: '1px solid var(--border)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  td: {
    padding: '14px 16px',
    color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
    fontSize: '0.95rem',
  },
  lowStockRow: { background: 'color-mix(in srgb, var(--danger) 8%, transparent)' },
  editBtn: {
    background: 'var(--primary-soft)',
    color: 'var(--primary)',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    marginRight: '8px',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  deleteBtn: {
    background: 'transparent',
    color: 'var(--danger)',
    border: '1px solid var(--danger)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  emptyCell: {
    textAlign: 'center',
    padding: '30px',
    color: 'var(--text-muted)',
  },
}