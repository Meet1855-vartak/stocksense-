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

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanResults, setScanResults] = useState([])
  const [detectedName, setDetectedName] = useState('')
  const [productExists, setProductExists] = useState(true)
  const [creatingProduct, setCreatingProduct] = useState(false)

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
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

      if (result.error) setError(result.error)
      else setScanResults(result.items || [])
    } catch (err) {
      setError('Failed to analyze image: ' + err.message)
    } finally {
      setScanning(false)
    }
  }

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

    if (error) setError(error.message)
    else {
      await fetchProducts()
      setProductId(data.id)
      setProductExists(true)
    }
    setCreatingProduct(false)
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Add Stock</h1>
        <p style={styles.subtitle}>Update inventory manually or scan a shelf photo</p>
      </div>

      <div style={styles.formCard}>
        {detectedName && (
          <div style={styles.detectedBox}>
            {productExists ? (
              <p style={{ margin: 0 }}>Detected item: <strong>{detectedName}</strong> — matched and selected below.</p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px' }}>Detected item: <strong>{detectedName}</strong> — no matching product found.</p>
                <button type="button" onClick={handleCreateProductFromScan} disabled={creatingProduct} style={styles.smallPrimaryBtn}>
                  {creatingProduct ? 'Creating...' : `+ Add "${detectedName}" as new product`}
                </button>
                <span style={styles.hint}> (created with price ₹0 — edit later in Products)</span>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} style={styles.form}>
          <select style={styles.input} value={productId} onChange={(e) => setProductId(e.target.value)} required>
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} (current: {p.quantity})</option>
            ))}
          </select>
          <input style={styles.input} type="number" placeholder="Quantity to add" value={quantityAdded} onChange={(e) => setQuantityAdded(e.target.value)} required />
          <button type="submit" style={styles.primaryBtn}>Add Stock</button>
        </form>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <div style={styles.scanCard}>
        <h3 style={styles.formTitle}>📸 Scan Shelf Photo (AI-assisted)</h3>
        <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={styles.fileInput} />
        {imagePreview && (
          <div style={{ marginTop: '14px' }}>
            <img src={imagePreview} alt="preview" style={styles.previewImg} />
            <br />
            <button onClick={handleScanImage} disabled={scanning} style={{ ...styles.primaryBtn, marginTop: '12px' }}>
              {scanning ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        )}

        {scanResults.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: 'var(--text)', marginBottom: '10px' }}>Detected Items:</h4>
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Est. Quantity</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scanResults.map((item, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{item.name}</td>
                      <td style={styles.td}>{item.estimated_quantity}</td>
                      <td style={styles.td}>
                        <button onClick={() => applyScanResult(item)} style={styles.smallPrimaryBtn}>Use this</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <h2 style={styles.sectionTitle}>Recent Stock Entries</h2>
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Quantity Added</th>
              <th style={styles.th}>Source</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td style={styles.td}>{e.products?.name}</td>
                <td style={styles.td}>{e.quantity_added}</td>
                <td style={styles.td}>
                  <span style={e.source === 'photo' ? styles.badgePhoto : styles.badgeManual}>{e.source}</span>
                </td>
                <td style={styles.td}>{new Date(e.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan="4" style={styles.emptyCell}>No stock entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
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
    marginBottom: '20px',
  },
  formTitle: { margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text)' },
  form: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  input: { minWidth: '160px', flex: '1 1 160px' },
  detectedBox: {
    background: 'var(--primary-soft)',
    color: 'var(--text)',
    padding: '14px',
    borderRadius: '10px',
    marginBottom: '16px',
  },
  hint: { fontSize: '0.85em', color: 'var(--text-muted)' },
  primaryBtn: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 600,
  },
  smallPrimaryBtn: {
    background: 'var(--primary-soft)',
    color: 'var(--primary)',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontWeight: 500,
    fontSize: '0.9rem',
  },
  error: { color: 'var(--danger)', marginBottom: '16px' },
  success: { color: 'var(--success)', marginBottom: '16px' },
  scanCard: {
    background: 'var(--bg-elevated)',
    borderRadius: '14px',
    padding: '22px',
    boxShadow: 'var(--shadow)',
    marginBottom: '30px',
    border: '1px dashed var(--border)',
  },
  fileInput: { color: 'var(--text)' },
  previewImg: { maxWidth: '280px', borderRadius: '10px', boxShadow: 'var(--shadow)' },
  sectionTitle: { fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' },
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
  badgeManual: {
    background: 'var(--border)',
    color: 'var(--text-muted)',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
  },
  badgePhoto: {
    background: 'var(--primary-soft)',
    color: 'var(--primary)',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
  },
  emptyCell: { textAlign: 'center', padding: '30px', color: 'var(--text-muted)' },
}