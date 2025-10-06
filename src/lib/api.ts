import { buildApiUrl, logApiCall } from '@/config/api'

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path)
  const method = init?.method || 'GET'
  
  // Log en desarrollo
  logApiCall(method, url, init?.body ? JSON.parse(init.body as string) : undefined)
  
  // ✅ Solo enviar Content-Type si hay body (evita CORS preflight en GET)
  const headers: Record<string, string> = {}
  if (init?.body) {
    headers['Content-Type'] = 'application/json'
  }
  
  const res = await fetch(url, {
    ...init,
    headers: {
      ...headers,
      ...init?.headers,
    },
  })
  
  if (!res.ok) {
    // Crear un error más detallado que incluya el status y el body
    let errorBody
    try {
      errorBody = await res.json()
    } catch {
      errorBody = { detail: 'Unknown error' }
    }
    
    const error = new Error(`HTTP ${res.status}`) as any
    error.status = res.status
    error.response = { status: res.status, data: errorBody }
    throw error
  }
  
  if (res.status === 204) return null as T // Handle No Content for DELETE
  return res.json() as Promise<T>
}

// Orders
export const getOrders = (params?: { status?: string; user_id?: number }) => {
  if (!params) return fetchJson<any[]>(`/api/orders/orders/`)
  const q = new URLSearchParams()
  if (params.status && params.status !== 'all') q.set('status', params.status)
  if (params.user_id != null) q.set('user_id', String(params.user_id))
  const qs = q.toString()
  return fetchJson<any[]>(`/api/orders/orders/${qs ? `?${qs}` : ''}`)
}

// Products (orders microservice)
export const getProducts = () => fetchJson<any[]>(`/api/orders/products`)
export const getProduct = (id: number) => fetchJson<any>(`/api/orders/products/${id}`)
// Nota: backend no soporta paginación nativa actualmente
export const getOrder = (id: number) => fetchJson<any>(`/api/orders/orders/${id}`)
export const updateOrder = (id: number, body: Partial<{ user_id: number; product_id: number; status: string; total_price: number; payment_method: string }>) =>
  fetchJson<any>(`/api/orders/orders/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteOrder = (id: number) => fetchJson<void>(`/api/orders/orders/${id}`, { method: 'DELETE' })
export const createOrder = (body: { user_id: number; product_id: number; status: string; total_price: number; payment_method: string }) =>
  fetchJson<any>(`/api/orders/orders/`, { method: 'POST', body: JSON.stringify(body) })

// Carrito del usuario (orders microservice)
export const getUserCart = (userId: number) => 
  fetchJson<any[]>(`/api/orders/orders?user_id=${userId}`)

export const confirmOrder = (orderId: number) =>
  fetchJson<any>(`/api/orders/orders/${orderId}`, { 
    method: 'PUT', 
    body: JSON.stringify({ status: 'confirmed' }) 
  })

export const removeFromCart = (orderId: number) =>
  fetchJson<void>(`/api/orders/orders/${orderId}`, { method: 'DELETE' })

// Users (orders microservice - FastAPI + MySQL)
export const createUser = (body: { 
  name: string; 
  email: string; 
  phone_number: string; 
  address: string 
}) =>
  fetchJson<any>(`/api/orders/users/`, { method: 'POST', body: JSON.stringify(body) })

export const getUser = (id: number) => fetchJson<any>(`/api/orders/users/${id}/`)
export const getUsers = () => fetchJson<any[]>(`/api/orders/users/`)

// Menu (Spring)
export const getMakis = () => fetchJson<any[]>(`/api/menu/api/makis`)
export const getMaki = (id: number) => fetchJson<any>(`/api/menu/api/makis/${id}`)
export const createMaki = (body: { nombre: string; descripcion: string; precio: number; ingredientes?: number[] }) =>
  fetchJson<any>(`/api/menu/api/makis`, { method: 'POST', body: JSON.stringify(body) })
export const updateMaki = (id: number, body: Partial<{ nombre: string; descripcion: string; precio: number; ingredientes?: number[] }>) =>
  fetchJson<any>(`/api/menu/api/makis/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteMaki = (id: number) => fetchJson<void>(`/api/menu/api/makis/${id}`, { method: 'DELETE' })

// Inventory (Nest)
export const getIngredientes = () => fetchJson<any[]>(`/api/inventory/ingredientes`)
export const getIngrediente = (id: string) => fetchJson<any>(`/api/inventory/ingredientes/${id}`)
export const createIngrediente = (body: { nombre: string; categoria: string; unidad: string; stockActual: number; stockMinimo: number; precioUnitario: number; activo: boolean }) =>
  fetchJson<any>(`/api/inventory/ingredientes`, { method: 'POST', body: JSON.stringify(body) })
export const updateIngrediente = (id: string, body: Partial<{ nombre: string; categoria: string; unidad: string; stockActual: number; stockMinimo: number; precioUnitario: number; activo: boolean }>) => {
  // ✅ Filtrar solo campos permitidos para actualización
  const camposPermitidos = {
    nombre: body.nombre,
    categoria: body.categoria,
    unidad: body.unidad,
    stockActual: body.stockActual,
    stockMinimo: body.stockMinimo,
    precioUnitario: body.precioUnitario,
    activo: body.activo
  }
  
  // ✅ Remover campos undefined/null
  const datosLimpios = Object.fromEntries(
    Object.entries(camposPermitidos).filter(([_, value]) => value !== undefined && value !== null)
  )
  
  return fetchJson<any>(`/api/inventory/ingredientes/${id}`, { 
    method: 'PATCH', 
    body: JSON.stringify(datosLimpios) 
  })
}
export const deleteIngrediente = (id: string) => fetchJson<void>(`/api/inventory/ingredientes/${id}`, { method: 'DELETE' })


