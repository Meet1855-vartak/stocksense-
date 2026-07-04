import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Sales() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedQty, setSelectedQty] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [salesHistory, setSalesHistory] = useState([])

  // receipt scan state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanResults, setScanResults] = useState([])
  const [creatingProductFor, setCreatingProductFor] = useState(null)

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, price, quantity, reorder_threshold')
      .order('name')
    setProducts(data || [])
  }

  const fetchSalesHistory = async () => {
    const { data } = await supabase
      .from('sales')
      .select('*, sale_items(*, products(name))')
      .order('created_at', { ascending: false })
      .limit(10)
    setSalesHistory(data || [])
  }

  useEffect(() => {
    fetchProducts()
    fetchSalesHistory()
  }, [])

  const addToCart = () => {
    if (!selectedProduct || !selectedQty) return
    const product = products.find((p) => p.id === selectedProduct)
    const qty = parseInt(selectedQty)

    if (qty > product.quantity) {
      setError(`Only ${product.quantity} units of ${product.name} in stock`)
      return
    }

    setError('')
    setCart([...cart, { product_id: product.id, name: product.name, price: product.price, quantity: qty }])
    setSelectedProduct('')
    setSelectedQty('')
  }

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCompleteSale = async () => {
    if (cart.length === 0) return
    setError('')

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({ user_id: user.id, total_amount: total })
      .select()
      .single()

    if (saleError) { setError(saleError.message); return }

    const saleItems = cart.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems)
    if (itemsError) { setError(itemsError.message); return }

    const lowStockItems = []

    for (const item of cart) {
      const product = products.find((p) => p.id === item.product_id)
      const newQty = product.quantity - item.quantity
      await supabase.from('products').update({ quantity: newQty }).eq('id', item.product_id)

      if (newQty <= product.reorder_threshold) {
        lowStockItems.push({ name: product.name, quantity: newQty, threshold: product.reorder_threshold })
      }
    }

    setSuccess('Sale recorded successfully!')
    setCart([])
    setScanResults([])
    fetchProducts()
    fetchSalesHistory()

    // Send low-stock alert email if needed
    if (lowStockItems.length > 0) {
      const html = `
        <h2>Low Stock Alert — StockSense</h2>
        <p>The following products are at or below their reorder threshold after your latest sale:</p>
        <ul>
          ${lowStockItems.map((i) => `<li><strong>${i.name}</strong>: ${i.quantity} left (reorder at ${i.threshold})</li>`).join('')}
        </ul>
        <p>Consider restocking soon.</p>
      `

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session.access_token

        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            to: user.email,
            subject: `Low Stock Alert — ${lowStockItems.length} item(s) need restocking`,
            html,
          }),
        })
      } catch (err) {
        console.log('Low stock email failed:', err)
      }
    }
  }

  // ---- Receipt scan logic ----
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setScanResults([])
  }

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleScanReceipt = async () => {
    if (!imageFile) return
    setScanning(true)
    setError('')

    try {
      const base64 = await fileToBase64(imageFile)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session.access_token

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-receipt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageBase64: base64 }),
        }
      )

      const rawText = await res.text()
      let result
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/)
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawText)
      } catch {
        setError('Could not parse AI response.')
        setScanning(false)
        return
      }

      if (result.error) {
        setError(result.error)
      } else {
        setScanResults(result.items || [])
      }
    } catch (err) {
      setError('Failed to analyze receipt: ' + err.message)
    } finally {
      setScanning(false)
    }
  }

  const findMatch = (itemName) =>
    products.find((p) => p.name.toLowerCase() === itemName.toLowerCase())

  const addDetectedItemToCart = (item) => {
    const match = findMatch(item.name)
    if (!match) {
      setError(`No matching product found for "${item.name}".`)
      return
    }
    if (item.quantity > match.quantity) {
      setError(`Only ${match.quantity} units of ${match.name} in stock`)
      return
    }
    setError('')
    setCart([...cart, {
      product_id: match.id,
      name: match.name,
      price: match.price,
      quantity: item.quantity,
    }])
  }

  const handleCreateProductFromReceipt = async (item, index) => {
    setCreatingProductFor(index)
    setError('')

    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: item.name,
        category: 'Uncategorized',
        price: item.price || 0,
        quantity: 0,
        reorder_threshold: 5,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else {
      await fetchProducts()
    }
    setCreatingProductFor(null)
  }

  return (
    <div>
      <h1>Record Sale</h1>

      <div>
        <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — ₹{p.price} (stock: {p.quantity})</option>
          ))}
        </select>
        <input type="number" placeholder="Quantity" value={selectedQty} onChange={(e) => setSelectedQty(e.target.value)} />
        <button type="button" onClick={addToCart}>Add to Cart</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <div style={{ marginTop: '30px', padding: '15px', border: '1px dashed #999' }}>
        <h3>Scan Receipt (AI-assisted)</h3>
        <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} />
        {imagePreview && (
          <div style={{ marginTop: '10px' }}>
            <img src={imagePreview} alt="preview" style={{ maxWidth: '300px' }} />
            <br />
            <button onClick={handleScanReceipt} disabled={scanning}>
              {scanning ? 'Analyzing...' : 'Analyze Receipt'}
            </button>
          </div>
        )}

        {scanResults.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <h4>Detected Items:</h4>
            <table border="1" cellPadding="6">
              <thead>
                <tr><th>Name</th><th>Qty</th><th>Price (OCR)</th><th>Action</th></tr>
              </thead>
              <tbody>
                {scanResults.map((item, i) => {
                  const match = findMatch(item.name)
                  return (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price}</td>
                      <td>
                        {match ? (
                          <button onClick={() => addDetectedItemToCart(item)}>Add to Cart</button>
                        ) : (
                          <button
                            onClick={() => handleCreateProductFromReceipt(item, i)}
                            disabled={creatingProductFor === i}
                          >
                            {creatingProductFor === i ? 'Creating...' : `+ Add "${item.name}" as new product`}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              Matches items by name to your existing products and uses your stored price for accuracy. New products start with 0 stock — add stock via Stock Entry before selling them.
            </p>
          </div>
        )}
      </div>

      <h3 style={{ marginTop: '20px' }}>Cart</h3>
      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead>
          <tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th><th></th></tr>
        </thead>
        <tbody>
          {cart.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>₹{item.price}</td>
              <td>₹{(item.price * item.quantity).toFixed(2)}</td>
              <td><button onClick={() => removeFromCart(i)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Total: ₹{total.toFixed(2)}</h3>
      <button onClick={handleCompleteSale} disabled={cart.length === 0}>Complete Sale</button>

      <h2 style={{ marginTop: '30px' }}>Recent Sales</h2>
      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead>
          <tr><th>Date</th><th>Items</th><th>Total</th></tr>
        </thead>
        <tbody>
          {salesHistory.map((s) => (
            <tr key={s.id}>
              <td>{new Date(s.created_at).toLocaleString()}</td>
              <td>{s.sale_items.map((si) => `${si.products?.name} x${si.quantity}`).join(', ')}</td>
              <td>₹{s.total_amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}