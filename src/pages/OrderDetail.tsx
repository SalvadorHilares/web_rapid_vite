import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrder, updateOrder, deleteOrder } from '@/lib/api'
import { toast } from '@/components/Toaster'
import { ConfirmDialog } from '@/components/Modal'

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getOrder(Number(id))
      .then((d) => { setData(d); setStatus(d?.status ?? '') })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [id])

  const onSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      await updateOrder(Number(id), { status })
      toast('Orden actualizada', 'success')
    } catch (e) {
      toast('Error al actualizar', 'error')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (!id) return
    try {
      await deleteOrder(Number(id))
      toast('Orden eliminada', 'success')
      navigate('/admin/orders')
    } catch (e) {
      toast('Error al eliminar', 'error')
    }
  }

  if (loading) return <div className="max-w-6xl mx-auto p-6">Cargando...</div>
  if (!data) return <div className="max-w-6xl mx-auto p-6">No encontrado</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Orden #{data.id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-md border">
        <div>
          <div className="text-sm text-gray-600">Cliente</div>
          <div className="font-medium">{data.user_name}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Producto</div>
          <div className="font-medium">{data.product_name}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Precio</div>
          <div className="font-medium">${data.total_price}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Pago</div>
          <div className="font-medium">{data.payment_method}</div>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600 mb-1 block">Estado</label>
          <select className="h-10 w-full md:w-64 rounded-md border border-gray-300 px-3 text-sm bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}>
            {['pending','confirmed','preparing','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">User ID</label>
          <input type="number" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" defaultValue={data.user_id} onBlur={(e) => (data.user_id = Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Product ID</label>
          <input type="number" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" defaultValue={data.product_id} onBlur={(e) => (data.product_id = Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Total</label>
          <input type="number" step="0.01" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" defaultValue={data.total_price} onBlur={(e) => (data.total_price = Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Payment</label>
          <select className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm bg-white" defaultValue={data.payment_method} onChange={(e) => (data.payment_method = e.target.value)}>
            {['cash','card','transfer'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="h-10 px-4 rounded-md border text-sm bg-gray-50 hover:bg-gray-100" onClick={onSave} disabled={saving}>Guardar</button>
        <button className="h-10 px-4 rounded-md border text-sm bg-red-50 hover:bg-red-100" onClick={() => setConfirmOpen(true)}>Eliminar</button>
      </div>
      <ConfirmDialog open={confirmOpen} title="Eliminar orden" message="¿Estás seguro de eliminar esta orden?"
        onCancel={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); onDelete() }} />
    </div>
  )
}


