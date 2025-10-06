import { create } from 'zustand'

export type Status = 'all' | 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled'

type AppState = {
  // filtros/paginación compartidos
  ordersStatus: Status
  ordersSearch: string
  ordersUserId: number | null
  ordersPage: number
  ordersPerPage: number

  setOrdersStatus: (s: Status) => void
  setOrdersSearch: (q: string) => void
  setOrdersUserId: (id: number | null) => void
  setOrdersPage: (p: number) => void
  setOrdersPerPage: (n: number) => void
  resetOrdersFilters: () => void

  // carrito (skeleton)
  cartItems: { productId: number, qty: number }[]
  addToCart: (productId: number, qty?: number) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void

  // cache de makis
  makis: any[]
  makisLoading: boolean
  makisLoaded: boolean
  setMakis: (makis: any[]) => void
  setMakisLoading: (loading: boolean) => void
  setMakisLoaded: (loaded: boolean) => void
  clearMakisCache: () => void
}

export const useAppStore = create<AppState>((set) => ({
  ordersStatus: 'all',
  ordersSearch: '',
  ordersUserId: null,
  ordersPage: 1,
  ordersPerPage: 20,

  setOrdersStatus: (s) => set({ ordersStatus: s, ordersPage: 1 }),
  setOrdersSearch: (q) => set({ ordersSearch: q, ordersPage: 1 }),
  setOrdersUserId: (id) => set({ ordersUserId: id, ordersPage: 1 }),
  setOrdersPage: (p) => set({ ordersPage: p }),
  setOrdersPerPage: (n) => set({ ordersPerPage: n, ordersPage: 1 }),
  resetOrdersFilters: () => set({ ordersStatus: 'all', ordersSearch: '', ordersUserId: null, ordersPage: 1 }),

  cartItems: [],
  addToCart: (productId, qty = 1) => set((state) => {
    const exists = state.cartItems.find((i) => i.productId === productId)
    if (exists) {
      return { cartItems: state.cartItems.map((i) => i.productId === productId ? { ...i, qty: i.qty + qty } : i) }
    }
    return { cartItems: [...state.cartItems, { productId, qty }] }
  }),
  removeFromCart: (productId) => set((state) => ({ cartItems: state.cartItems.filter((i) => i.productId !== productId) })),
  clearCart: () => set({ cartItems: [] }),

  // cache de makis
  makis: [],
  makisLoading: false,
  makisLoaded: false,
  setMakis: (makis) => set({ makis, makisLoaded: true }),
  setMakisLoading: (loading) => set({ makisLoading: loading }),
  setMakisLoaded: (loaded) => set({ makisLoaded: loaded }),
  clearMakisCache: () => set({ makis: [], makisLoaded: false, makisLoading: false }),
}))


