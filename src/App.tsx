import './App.css'
import { Routes, Route } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Home from '@/pages/Home'
import AdminOrders from '@/pages/AdminOrders'
import Makis from '@/pages/Makis'
import MakiDetail from '@/pages/MakiDetail'
import Cart from '@/pages/Cart'
import OrderDetail from '@/pages/OrderDetail'
import OrderCreate from '@/pages/OrderCreate'
import AdminInventory from '@/pages/AdminInventory'
import AdminMakis from '@/pages/AdminMakis'
import Toaster from '@/components/Toaster'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/makis" element={<Makis />} />
          <Route path="/makis/:id" element={<MakiDetail />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/new" element={<OrderCreate />} />
          <Route path="/admin/orders/:id" element={<OrderDetail />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/makis" element={<AdminMakis />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}

export default App