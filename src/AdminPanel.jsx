import { useState, useRef } from 'react'

const API = 'http://localhost:5000/api'

const GRAD_OPTIONS = [
  'linear-gradient(135deg,#ff6b35,#f7c59f)',
  'linear-gradient(135deg,#a855f7,#6366f1)',
  'linear-gradient(135deg,#ef4444,#f97316)',
  'linear-gradient(135deg,#06b6d4,#3b82f6)',
  'linear-gradient(135deg,#10b981,#84cc16)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#ec4899,#a855f7)',
  'linear-gradient(135deg,#6366f1,#06b6d4)',
]

export default function AdminPanel({ onVenueAdded, onClose }) {
  const [form, setForm] = useState({
    name: '', city: '', type: '', address: '',
    occupancy: 50, rating: 4.0, tags: '', isOpen: true,
    grad: GRAD_OPTIONS[0], img: '',
  })
  const [loading, setLoading]         = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [uploadProgress, setProgress] = useState(0)
  const [success, setSuccess]         = useState(false)
  const [error, setError]             = useState('')
  const [preview, setPreview]         = useState('')
  const fileRef = useRef()

  const handle = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  // Upload image to S3 via presigned URL
  const handleFileChange = async e => {
    const file = e.target.files[0]
    if (!file) return

    // Show local preview immediately
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    setProgress(0)
    setError('')

    try {
      // Step 1: Get presigned URL from backend
      const res = await fetch(
        `${API}/upload/presign?filename=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type)}`
      )
      const { uploadUrl, imageUrl } = await res.json()

      // Step 2: Upload directly to S3
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = e => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        }
        xhr.onload = () => xhr.status === 200 ? resolve() : reject(new Error('Upload failed'))
        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      // Step 3: Save final S3 URL to form
      setForm(f => ({ ...f, img: imageUrl }))
      setProgress(100)
    } catch (err) {
      setError('Image upload failed: ' + err.message)
      setPreview('')
    }
    setUploading(false)
  }

  const submit = async () => {
    if (!form.name || !form.city || !form.type || !form.address) {
      setError('Please fill in all required fields!')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/venues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          occupancy: Number(form.occupancy),
          rating:    Number(form.rating),
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          img: form.img || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSuccess(true)
      onVenueAdded(data)
      setTimeout(() => {
        setSuccess(false)
        setPreview('')
        setProgress(0)
        setForm({
          name: '', city: '', type: '', address: '',
          occupancy: 50, rating: 4.0, tags: '', isOpen: true,
          grad: GRAD_OPTIONS[0], img: '',
        })
      }, 2000)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#fff', fontSize: 13,
    outline: 'none',
  }

  const labelStyle = {
    fontSize: 9, letterSpacing: '2px', fontWeight: 700,
    color: 'rgba(255,255,255,0.3)', marginBottom: 6, display: 'block',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#0e0b1e', borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.1)',
        width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto',
        padding: 28,
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '3px', color: 'rgba(168,85,247,0.7)', marginBottom: 4, fontWeight: 700 }}>ADMIN PANEL</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Add New Venue</div>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', cursor: 'pointer', fontSize: 14,
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>VENUE NAME *</label>
            <input name="name" value={form.name} onChange={handle}
              placeholder="e.g. Kitty Su" style={inputStyle} />
          </div>

          {/* City + Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>CITY SLUG *</label>
              <input name="city" value={form.city} onChange={handle}
                placeholder="delhi / gurgaon / noida" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>TYPE *</label>
              <input name="type" value={form.type} onChange={handle}
                placeholder="Club / Lounge / Bar" style={inputStyle} />
            </div>
          </div>

          {/* Address */}
          <div>
            <label style={labelStyle}>ADDRESS *</label>
            <input name="address" value={form.address} onChange={handle}
              placeholder="e.g. Sector 29, Gurgaon" style={inputStyle} />
          </div>

          {/* ── IMAGE UPLOAD ── */}
          <div>
            <label style={labelStyle}>VENUE IMAGE</label>

            {/* Upload area */}
            <div
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${preview ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, overflow: 'hidden',
                cursor: 'pointer', transition: 'border-color 0.2s',
                background: 'rgba(255,255,255,0.02)',
                minHeight: 120,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}
            >
              {preview ? (
                <>
                  <img src={preview} alt="preview"
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                  {/* progress overlay */}
                  {uploading && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}>
                      <div style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>
                        Uploading to S3... {uploadProgress}%
                      </div>
                      <div style={{ width: '70%', height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                        <div style={{
                          width: `${uploadProgress}%`, height: '100%',
                          background: 'linear-gradient(135deg,#a855f7,#ec4899)',
                          borderRadius: 2, transition: 'width 0.3s',
                        }} />
                      </div>
                    </div>
                  )}
                  {!uploading && uploadProgress === 100 && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(48,209,88,0.9)', borderRadius: 20,
                      padding: '4px 10px', fontSize: 10, fontWeight: 700, color: '#fff',
                    }}>✅ Uploaded to S3</div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                    Click to upload image
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
                    JPG, PNG, WEBP supported
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileRef} type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Occupancy + Rating */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>OCCUPANCY: {form.occupancy}%</label>
              <input name="occupancy" type="range" min="0" max="100"
                value={form.occupancy} onChange={handle}
                style={{ width: '100%', accentColor: '#a855f7' }} />
            </div>
            <div>
              <label style={labelStyle}>RATING: {form.rating}</label>
              <input name="rating" type="range" min="0" max="5" step="0.1"
                value={form.rating} onChange={handle}
                style={{ width: '100%', accentColor: '#a855f7' }} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>TAGS (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handle}
              placeholder="EDM, Rooftop, Live Music" style={inputStyle} />
          </div>

          {/* Gradient picker */}
          <div>
            <label style={labelStyle}>CARD COLOR</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {GRAD_OPTIONS.map(g => (
                <div key={g} onClick={() => setForm(f => ({ ...f, grad: g }))}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: g, cursor: 'pointer',
                    border: form.grad === g ? '2px solid #fff' : '2px solid transparent',
                    transition: 'border 0.15s',
                  }} />
              ))}
            </div>
          </div>

          {/* Is Open */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input name="isOpen" type="checkbox" checked={form.isOpen}
              onChange={handle} style={{ accentColor: '#a855f7', width: 16, height: 16 }} />
            <label style={{ ...labelStyle, marginBottom: 0 }}>OPEN NOW</label>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(255,45,85,0.1)',
              border: '1px solid rgba(255,45,85,0.3)',
              color: '#ff2d55', fontSize: 12,
            }}>
              ❌ {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(48,209,88,0.1)',
              border: '1px solid rgba(48,209,88,0.3)',
              color: '#30d158', fontSize: 12,
            }}>
              ✅ Venue added successfully!
            </div>
          )}

          {/* Submit */}
          <button onClick={submit} disabled={loading || uploading} style={{
            width: '100%', padding: 15, borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg,#a855f7,#ec4899)',
            color: '#fff', fontSize: 14, fontWeight: 800,
            cursor: loading || uploading ? 'not-allowed' : 'pointer',
            opacity: loading || uploading ? 0.7 : 1,
            transition: 'opacity 0.15s',
          }}>
            {loading ? 'Adding...' : uploading ? 'Waiting for upload...' : '✦ Add Venue to MongoDB'}
          </button>

        </div>
      </div>
    </div>
  )
}
