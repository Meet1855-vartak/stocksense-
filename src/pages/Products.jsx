import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Products() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // form state
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
      user_id: user.id,
    }

    let result
    if (editingId) {
      result = await supabase.from('products').update(payload).eq('id', editingId)
    } else {
      result = await supabase.from('products').insert(payload)
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
    if (error) setError(error.message)
    else fetchProducts()
  }

  return (
    <div>
      <h1>Products</h1>

      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input type="number" step="0.01" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <input type="number" placeholder="Reorder Threshold" value={reorderThreshold} onChange={(e) => setReorderThreshold(e.target.value)} />
        <button type="submit">{editingId ? 'Update Product' : 'Add Product'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: '20px', width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Reorder At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ background: p.quantity <= p.reorder_threshold ? '#fdd' : 'transparent' }}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.price}</td>
                <td>{p.quantity}</td>
                <td>{p.reorder_threshold}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>Edit</button>
                  <button onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}