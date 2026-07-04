import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function StockEntry() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState('')
  const [quantityAdded, setQuantityAdded] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [entries, setEntries] = useState([])

  // photo scan state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanResults, setScanResults] = useState([])
  const [detectedName, setDetectedName] = useState('')
  const [productExists, setProductExists] = useState(true) // NEW
  const [creatingProduct, setCreatingProduct] = useState(false) // NEW

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name, quantity').order('name')
    setProducts(data || [])
  }

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('stock_entries')
      .select('*, products(name)')
      .order('created_at', { ascending: false })
      .limit(20)
    setEntries(data || [])
  }

  useEffect(() => {
    fetchProducts()
    fetchEntries()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!productId || !quantityAdded) return

    const { error: entryError } = await supabase.from('stock_entries').insert({
      product_id: productId,
      quantity_added: parseInt(quantityAdded),
      source: 'manual',
    })
    if (entryError) { setError(entryError.message); return }

    const product = products.find((p) => p.id === productId)
    const newQuantity = product.quantity + parseInt(quantityAdded)

    const { error: updateError } = await supabase
      .from('products').update({ quantity: newQuantity }).eq('id', productId)
    if (updateError) { setError(updateError.message); return }

    setSuccess('Stock updated successfully!')
    setProductId('')
    setQuantityAdded('')
    setDetectedName('')
    fetchProducts()
    fetchEntries()
  }

  // ---- Photo scan logic ----
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setScanResults([])
    setDetectedName('')
  }

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleScanImage = async () => {
    if (!imageFile) return
    setScanning(true)
    setError('')

    try {
      const base64 = await fileToBase64(imageFile)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session.access_token

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-stock-image`,
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
      setError('Failed to analyze image: ' + err.message)
    } finally {
      setScanning(false)
    }
  }

  // Checks if a matching product exists; if yes, auto-selects it. If not, shows "add new" option.
  const applyScanResult = (item) => {
    setDetectedName(item.name)
    setQuantityAdded(String(item.estimated_quantity))

    const match = products.find((p) => p.name.toLowerCase() === item.name.toLowerCase())
    if (match) {
      setProductId(match.id)
      setProductExists(true)
    } else {
      setProductId('')
      setProductExists(false)
    }
  }

  // Creates a new product on the fly using the detected name, then selects it
  const handleCreateProductFromScan = async () => {
    if (!detectedName) return
    setCreatingProduct(true)
    setError('')

    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: detectedName,
        category: 'Uncategorized',
        price: 0,
        quantity: 0,
        reorder_threshold: 5,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else {
      await fetchProducts()
      setProductId(data.id)
      setProductExists(true)
    }
    setCreatingProduct(false)
  }

  return (
    <div>
      <h1>Add Stock</h1>

      <form onSubmit={handleSubmit}>
        {detectedName && (
          <div style={{ background: '#eef', padding: '8px', borderRadius: '4px', marginBottom: '10px' }}>
            {productExists ? (
              <p>Detected item: <strong>{detectedName}</strong> — matched and selected below.</p>
            ) : (
              <div>
                <p>Detected item: <strong>{detectedName}</strong> — no matching product found.</p>
                <button type="button" onClick={handleCreateProductFromScan} disabled={creatingProduct}>
                  {creatingProduct ? 'Creating...' : `+ Add "${detectedName}" as new product`}
                </button>
                <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '8px' }}>
                  (created with price ₹0 — edit it later in Products)
                </span>
              </div>
            )}
          </div>
        )}
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} (current: {p.quantity})</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantity to add"
          value={quantityAdded}
          onChange={(e) => setQuantityAdded(e.target.value)}
          required
        />
        <button type="submit">Add Stock</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <div style={{ marginTop: '30px', padding: '15px', border: '1px dashed #999' }}>
        <h3>Scan Shelf Photo (AI-assisted)</h3>
        <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} />
        {imagePreview && (
          <div style={{ marginTop: '10px' }}>
            <img src={imagePreview} alt="preview" style={{ maxWidth: '300px' }} />
            <br />
            <button onClick={handleScanImage} disabled={scanning}>
              {scanning ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        )}

        {scanResults.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <h4>Detected Items:</h4>
            <table border="1" cellPadding="6">
              <thead>
                <tr><th>Name</th><th>Est. Quantity</th><th>Action</th></tr>
              </thead>
              <tbody>
                {scanResults.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.estimated_quantity}</td>
                    <td><button onClick={() => applyScanResult(item)}>Use this</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <h2 style={{ marginTop: '30px' }}>Recent Stock Entries</h2>
      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead>
          <tr><th>Product</th><th>Quantity Added</th><th>Source</th><th>Date</th></tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td>{e.products?.name}</td>
              <td>{e.quantity_added}</td>
              <td>{e.source}</td>
              <td>{new Date(e.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}