import { useState } from 'react'
import { createOrder } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/components/Toaster'

export default function OrderCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    user_id: 1,
    product_id: 1,
    status: 'confirmed',
    total_price: 0,
    payment_method: 'card',
  })
  const [saving, setSaving] = useState(false)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'user_id' || name === 'product_id' || name === 'total_price' ? Number(value) : value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createOrder(form)
      toast('Orden creada', 'success')
      navigate('/admin/orders')
    } catch (err) {
      toast('Error al crear', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Nueva orden</h1>
      <form onSubmit={onSubmit} className="bg-white border rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">User ID</label>
          <input name="user_id" type="number" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" value={form.user_id}
            onChange={onChange} required />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Product ID</label>
          <input name="product_id" type="number" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" value={form.product_id}
            onChange={onChange} required />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Status</label>
          <select name="status" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm bg-white" value={form.status} onChange={onChange}>
            {['pending','confirmed','preparing','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Total</label>
          <input name="total_price" type="number" step="0.01" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" value={form.total_price}
            onChange={onChange} required />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600 mb-1 block">Pago</label>
          <select name="payment_method" className="h-10 w-full md:w-64 rounded-md border border-gray-300 px-3 text-sm bg-white" value={form.payment_method} onChange={onChange}>
            {['cash','card','transfer'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="md:col-span-2 flex gap-2">
          <button disabled={saving} className="h-10 px-4 rounded-md border text-sm bg-gray-50 hover:bg-gray-100" type="submit">Crear</button>
          <button type="button" className="h-10 px-4 rounded-md border text-sm bg-gray-50 hover:bg-gray-100" onClick={() => navigate('/admin/orders')}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}


