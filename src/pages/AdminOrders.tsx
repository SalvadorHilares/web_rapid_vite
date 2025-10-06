import { useEffect, useState, useCallback } from 'react'
import { useAppStore, type Status } from '@/store/useAppStore'
import { getOrders } from '@/lib/api'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Modal } from '@/components/Modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { updateOrder, deleteOrder } from '@/lib/api'
import { toast } from '@/components/Toaster'

interface Order {
  id: number;
  user_id: number;
  product_id: number;
  status: string;
  total_price: number;
  payment_method: string;
  order_date: string;
  user_name: string;
  product_name: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const statusFilter = useAppStore((s) => s.ordersStatus)
  const searchTerm = useAppStore((s) => s.ordersSearch)
  const ordersUserId = useAppStore((s) => s.ordersUserId)
  const currentPage = useAppStore((s) => s.ordersPage)
  const itemsPerPage = useAppStore((s) => s.ordersPerPage)
  const setOrdersPerPage = useAppStore((s) => s.setOrdersPerPage)
  const setStatusFilter = useAppStore((s) => s.setOrdersStatus)
  const setSearchTerm = useAppStore((s) => s.setOrdersSearch)
  const setCurrentPage = useAppStore((s) => s.setOrdersPage)
  const resetFilters = useAppStore((s) => s.resetOrdersFilters)
  const setOrdersUserId = useAppStore((s) => s.setOrdersUserId)

  const [total, setTotal] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('confirmed')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  // Debounce para el filtro de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Función para cargar órdenes (sin dependencias que causen re-renders)
  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      // Obtener valores actuales directamente del store
      const currentStatus = useAppStore.getState().ordersStatus
      const currentUserId = useAppStore.getState().ordersUserId
      const currentSearch = useAppStore.getState().ordersSearch
      const currentPage = useAppStore.getState().ordersPage
      const currentPerPage = useAppStore.getState().ordersPerPage
      
      // Cargar todas las órdenes (el backend no soporta filtros complejos)
      const rows = await getOrders()
      const data = Array.isArray(rows) ? rows : []
      
      // Aplicar filtros en el frontend
      let filteredData = data
      
      // Filtro por estado
      if (currentStatus !== 'all') {
        filteredData = filteredData.filter(order => order.status === currentStatus)
      }
      
      // Filtro por user_id
      if (currentUserId !== null) {
        filteredData = filteredData.filter(order => order.user_id === currentUserId)
      }
      
      // Filtro por búsqueda de texto
      if (currentSearch.trim()) {
        const searchLower = currentSearch.trim().toLowerCase()
        filteredData = filteredData.filter(order => 
          order.product_name?.toLowerCase().includes(searchLower) ||
          order.user_name?.toLowerCase().includes(searchLower) ||
          order.payment_method?.toLowerCase().includes(searchLower) ||
          order.id.toString().includes(searchLower) ||
          order.user_id?.toString().includes(searchLower) ||
          order.total_price?.toString().includes(searchLower)
        )
      }
      
      setTotal(filteredData.length)
      
      // Paginación en cliente
      const startIndex = (currentPage - 1) * currentPerPage
      setOrders(filteredData.slice(startIndex, startIndex + currentPerPage))
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, []) // Sin dependencias para evitar re-renders

  // Función para actualizar solo un elemento específico
  const updateOrderInList = (updatedOrder: Order) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    )
  }

  // Función para eliminar un elemento específico
  const removeOrderFromList = (orderId: number) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId))
    setTotal(prevTotal => prevTotal - 1)
  }

  // useEffect optimizado - solo se ejecuta cuando cambian los filtros
  useEffect(() => {
    loadOrders()
  }, [currentPage, itemsPerPage, statusFilter, ordersUserId, debouncedSearchTerm])

  const totalPages = Math.max(1, Math.ceil((total || 0) / itemsPerPage))
  const currentOrders = orders

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const total = totalPages
    if (total <= 5) { for (let i = 1; i <= total; i++) pages.push(i); return pages }
    if (currentPage <= 3) { pages.push(1, 2, 3, 4, 'ellipsis', total); return pages }
    if (currentPage >= total - 2) { pages.push(1, 'ellipsis', total-3, total-2, total-1, total); return pages }
    pages.push(1, 'ellipsis', currentPage-1, currentPage, currentPage+1, 'ellipsis', total)
    return pages
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin · Órdenes ({total} total)</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto">
          <div className="flex flex-col text-left">
            <label className="text-sm text-gray-600 mb-1">Buscar</label>
            <Input placeholder="Producto, cliente, pago..." value={searchTerm}
              onChange={(e) => { setCurrentPage(1); setSearchTerm((e.target as HTMLInputElement).value) }} />
          </div>
          <div className="flex flex-col text-left">
            <label className="text-sm text-gray-600 mb-1">User ID</label>
            <Input type="number" placeholder="Filtrar por usuario" value={ordersUserId ?? ''}
              onChange={(e) => { const v = (e.target as HTMLInputElement).value; setCurrentPage(1); setOrdersUserId(v === '' ? null : Number(v)) }} />
          </div>
          <div className="flex flex-col text-left">
            <label className="text-sm text-gray-600 mb-1">Estado</label>
            <Select value={statusFilter} onChange={(e) => { setCurrentPage(1); setStatusFilter((e.target as HTMLSelectElement).value as Status) }}>
              <option value="all">Todos</option>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="preparing">preparing</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </Select>
          </div>
          <div className="flex gap-2 items-end">
            <button className="h-10 px-4 rounded-md border text-sm bg-gray-50 hover:bg-gray-100"
              onClick={() => { resetFilters() }}>Limpiar filtros</button>
            <a href="/admin/orders/new" className="h-10 px-4 rounded-md border text-sm bg-blue-50 hover:bg-blue-100 flex items-center">Nueva orden</a>
            <Select value={String(itemsPerPage)} onChange={(e) => setOrdersPerPage(Number((e.target as HTMLSelectElement).value))}>
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/pág</option>)}
            </Select>
            <div className="text-xs text-gray-600 hidden md:block">Página {currentPage} de {totalPages}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : currentOrders.length === 0 ? (
          <div className="text-center text-gray-600 py-8">No hay órdenes</div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <a href={`/admin/orders/${order.id}`} className="text-lg font-semibold mb-1 hover:underline">{order.product_name}</a>
                    <p className="text-gray-600">Cliente: {order.user_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' : 
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'}`}>{order.status}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-gray-600">ID:</span><span className="ml-2 font-medium">{order.id}</span></div>
                  <div><span className="text-gray-600">Precio:</span><span className="ml-2 font-medium">${order.total_price}</span></div>
                  <div><span className="text-gray-600">Pago:</span><span className="ml-2 font-medium">{order.payment_method}</span></div>
                  <div><span className="text-gray-600">Fecha:</span><span className="ml-2 font-medium">{new Date(order.order_date).toLocaleDateString()}</span></div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="h-9 px-3 rounded-md border text-sm bg-gray-50 hover:bg-gray-100" onClick={() => { setSelected(order); setNewStatus(order.status); setModalOpen(true) }}>Cambiar estado</button>
                  <button className="h-9 px-3 rounded-md border text-sm bg-red-50 hover:bg-red-100" onClick={() => { setSelected(order); setDeleteOpen(true) }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e: any) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1) }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
              </PaginationItem>
              {getPageNumbers().map((page, i) => (
                <PaginationItem key={i}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink href="#" isActive={currentPage === page} onClick={(e: any) => { e.preventDefault(); setCurrentPage(page as number) }} className="cursor-pointer">{page}</PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e: any) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1) }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Cambiar Estado · Orden #${selected?.id}`} footer={
            <>
              <button 
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200" 
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#FF8F1E] hover:bg-[#e67d18] transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={updating} 
                onClick={async () => {
                  if (!selected) return
                  setUpdating(true)
                  try {
                    await updateOrder(selected.id, { status: newStatus })
                    toast('Estado actualizado', 'success')
                    setModalOpen(false)
                    // Actualizar solo el elemento específico
                    updateOrderInList({ ...selected, status: newStatus })
                  } catch (e) {
                    toast('Error al actualizar', 'error')
                  } finally {
                    setUpdating(false)
                  }
                }}
              >
                {updating ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </>
          }>
        <div className="text-sm">
          <label className="text-sm text-gray-600 mb-1 block">Nuevo estado</label>
          <select className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm bg-white" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {['pending','confirmed','preparing','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={`Eliminar Orden · #${selected?.id}`} footer={
        <>
          <button 
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200" 
            onClick={() => setDeleteOpen(false)}
          >
            Cancelar
          </button>
          <button 
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={updating} 
            onClick={async () => {
              if (!selected) return
              setUpdating(true)
              try {
                await deleteOrder(selected.id)
                toast('Orden eliminada', 'success')
                setDeleteOpen(false)
                // Eliminar solo el elemento específico
                removeOrderFromList(selected.id)
              } catch (e) {
                toast('Error al eliminar', 'error')
              } finally {
                setUpdating(false)
              }
            }}
          >
            {updating ? 'Eliminando...' : 'Eliminar Orden'}
          </button>
        </>
      }>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <p className="text-gray-700 font-medium">¿Estás seguro de que quieres eliminar esta orden?</p>
            <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer.</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}


