import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi'

interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  opcion: string;
  alergico: string;
}

export default function Header() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])

  // 🔄 Detectar scroll para header transparente
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleAbrirCarrito = () => setCartOpen(true)
    window.addEventListener("abrirCarrito", handleAbrirCarrito)
    return () => window.removeEventListener("abrirCarrito", handleAbrirCarrito)
  }, [])

  // 🛒 Cargar carrito desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("carrito")
      if (stored) setCarrito(JSON.parse(stored))
    }
  }, []) // Solo se ejecuta una vez al montar

  // 🔄 Escuchar cambios en localStorage para actualizar el carrito
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("carrito")
        if (stored) {
          setCarrito(JSON.parse(stored))
        }
      }
    }

    // Escuchar eventos de storage
    window.addEventListener('storage', handleStorageChange)
    
    // Escuchar eventos personalizados para cambios en la misma pestaña
    window.addEventListener('carritoActualizado', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('carritoActualizado', handleStorageChange)
    }
  }, [])

  // 🧮 Calcular total
  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  // ➕➖ Cambiar cantidad
  const handleCantidad = (id: number, delta: number) => {
    const actualizado = carrito.map((item) =>
      item.id === id
        ? { ...item, cantidad: Math.max(1, item.cantidad + delta) }
        : item
    )
    setCarrito(actualizado)
    localStorage.setItem("carrito", JSON.stringify(actualizado))
  }

  // 🗑️ Eliminar producto
  const eliminarItem = (id: number) => {
    const actualizado = carrito.filter((item) => item.id !== id)
    setCarrito(actualizado)
    localStorage.setItem("carrito", JSON.stringify(actualizado))
  }

  return (
    <>
      {/* 🌸 ENCABEZADO */}
      <header
        className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-white/30 backdrop-blur-md shadow-md text-[#2A2521]"
            : "bg-transparent text-[#2A2521]"
        }`}
      >
        {/* 🍣 LOGO */}
        <Link
          to="/"
          className="text-2xl font-bold flex items-center gap-2 hover:opacity-90 transition"
        >
          🍣 <span>Maki Lover</span>
        </Link>

        {/* 🔗 MENÚ PRINCIPAL */}
        <nav className="hidden md:flex space-x-6 font-medium relative">
          {[
            { label: "Inicio", to: "/" },
            { label: "Makis", to: "/makis" },
            { label: "Carrito", to: "/carrito" },
            { label: "Admin Orders", to: "/admin/orders" },
            { label: "Admin Inventory", to: "/admin/inventory" },
            { label: "Admin Makis", to: "/admin/makis" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative px-5 py-2 rounded-full overflow-hidden group transition-all duration-300"
            >
              <span className="absolute inset-0 bg-[#FF8F1E]/50 rounded-full scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out"></span>
              <span className="relative z-10 group-hover:text-white transition-all duration-300">
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* 🧍‍♀️ ICONOS */}
        <div className="flex items-center gap-3">
          {/* Usuario */}
          <button className="p-2 rounded-full bg-[#FF8F1E]/50 hover:bg-[#FF8F1E] transition-all duration-300 text-white">
            <FiUser size={20} />
          </button>

          {/* Carrito */}
          <button
            onClick={() => setCartOpen(true)}
            className="p-2 rounded-full bg-[#FF8F1E]/50 hover:bg-[#FF8F1E] transition-all duration-300 text-white relative"
          >
            <FiShoppingCart size={20} />
            {carrito.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {carrito.length}
              </span>
            )}
          </button>

          {/* Menú lateral (sandwich) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-full bg-[#FF8F1E]/50 hover:bg-[#FF8F1E] transition-all duration-300 text-white"
          >
            <FiMenu size={22} />
          </button>
        </div>
      </header>

      {/* 🛒 CARRITO LATERAL */}
      {cartOpen && (
        <>
          {/* Fondo oscuro */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setCartOpen(false)}
          />

          {/* Panel lateral */}
          <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl z-50 flex flex-col">
            {/* 🔝 Encabezado */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2A2521]">
                <FiShoppingCart className="text-[#FF8F1E]" size={22} />
                TU PEDIDO
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="hover:text-[#FF8F1E] transition"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* 🥢 Lista de productos */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {carrito.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">
                  Tu carrito está vacío.
                </p>
              ) : (
                carrito.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-gray-200 pb-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-sm text-[#2A2521]">
                          {item.nombre}
                        </p>
                        <p className="text-[#FF8F1E] font-bold text-sm">
                          S/ {item.precio.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <button
                          onClick={() => handleCantidad(item.id, -1)}
                          className="w-6 h-6 border rounded-full flex items-center justify-center hover:bg-[#FF8F1E]/20 transition"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => handleCantidad(item.id, 1)}
                          className="w-6 h-6 border rounded-full flex items-center justify-center hover:bg-[#FF8F1E]/20 transition"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => eliminarItem(item.id)}
                        className="text-xs text-red-500 hover:text-red-600 mt-1"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 💰 Total y acciones */}
            <div className="px-6 py-6 border-t border-gray-200">
              <div className="flex justify-between mb-4 text-[#2A2521] font-medium">
                <span>Total:</span>
                <span className="font-bold">S/ {total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => {
                  setCartOpen(false)
                  navigate("/carrito")
                }}
                className="w-full bg-[#FF8F1E] text-white py-3 rounded-full font-semibold hover:bg-[#e67d18] transition mb-3"
              >
                Realizar Pedido 🍣
              </button>

              <button
                onClick={() => {
                  setCartOpen(false)
                  navigate("/makis")
                }}
                className="w-full border border-[#FF8F1E] text-[#2A2521] py-3 rounded-full hover:bg-[#FF8F1E]/20 transition font-medium"
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        </>
      )}

      {/* 📱 MENÚ LATERAL */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMenuOpen(false)}
          />

          <div className="fixed top-0 right-0 w-72 h-full bg-white shadow-2xl z-50 p-6 flex flex-col">
            <button
              className="self-end mb-6 text-[#2A2521] hover:text-[#FF8F1E] transition"
              onClick={() => setMenuOpen(false)}
            >
              <FiX size={28} />
            </button>

            {/* 🔗 LINKS */}
            <div className="flex flex-col space-y-4 font-semibold text-[#2A2521] text-lg">
              {[
                { label: "Makis", to: "/makis" },
                { label: "Carrito", to: "/carrito" },
                { label: "Admin Orders", to: "/admin/orders" },
                { label: "Admin Inventory", to: "/admin/inventory" },
                { label: "Admin Makis", to: "/admin/makis" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-4 py-2 rounded-full overflow-hidden group transition-all duration-300"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="absolute inset-0 bg-[#FF8F1E]/30 rounded-full scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out"></span>
                  <span className="relative z-10 group-hover:text-[#FF8F1E] transition-all duration-300">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}