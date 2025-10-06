import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getMaki } from '@/lib/api'
import { FiPlus, FiMinus } from 'react-icons/fi'

export default function MakiDetail() {
  const { id } = useParams()
  const [maki, setMaki] = useState<any>(null)
  const [cantidad, setCantidad] = useState(1)
  const [rolls, setRolls] = useState("5")
  const [alergico, setAlergico] = useState("No")

  // 🔹 Obtener datos del maki por ID
  useEffect(() => {
    if (id) {
      getMaki(Number(id))
        .then((data) => setMaki(data))
        .catch((err) => console.error("Error al obtener maki:", err))
    }
  }, [id])

  if (!maki) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FFF1EB] text-[#2A2521]">
        <p className="text-lg font-medium">Cargando maki...</p>
      </div>
    )
  }

  // 💰 Calcular el precio total dinámico
  const precioBase = rolls === "10" ? maki.precio * 2 - 3 : maki.precio
  const precioTotal = (precioBase * cantidad).toFixed(2)

  // 🛒 Agregar al carrito y abrir el carrito lateral (sin redirigir)
  const handleOrdenar = () => {
    const nuevoItem = {
      id: maki.id,
      nombre: maki.nombre,
      precio: precioBase,
      cantidad,
      imagen: "/images/acevichado.jpg",
      opcion: `${rolls} Makis`,
      alergico,
    }

    // Guardar en localStorage
    const carritoActual = JSON.parse(localStorage.getItem("carrito") || "[]")
    carritoActual.push(nuevoItem)
    localStorage.setItem("carrito", JSON.stringify(carritoActual))

    // 🔔 Disparar evento para actualizar el carrito en el Header
    window.dispatchEvent(new CustomEvent("carritoActualizado"))
    
    // 🔔 Enviar evento global para abrir el carrito lateral
    const evento = new CustomEvent("abrirCarrito")
    window.dispatchEvent(evento)
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FFF1EB] pt-24">
      {/* 🖼️ Imagen del maki (mitad izquierda centrada) */}
      <div className="relative md:w-1/2 w-full h-[50vh] md:h-auto">
        <img
          src="/images/acevichado.jpg"
          alt={maki.nombre}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* 🧾 Detalles del maki */}
      <div className="md:w-1/2 w-full flex flex-col justify-center px-10 md:px-20 py-10">
        <h1 className="text-4xl font-bold mb-3 text-[#2A2521]">{maki.nombre}</h1>
        <p className="text-2xl font-semibold text-[#FF8F1E] mb-4">S/ {precioTotal}</p>
        <p className="text-gray-700 mb-8 text-lg leading-relaxed">{maki.descripcion}</p>

        {/* 🍣 Cantidad de Rolls */}
        <div className="mb-8">
          <h3 className="font-semibold text-[#2A2521] mb-3 text-lg">
            Escoge la cantidad de Rolls
          </h3>
          <div className="flex flex-col gap-3 text-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rolls"
                value="10"
                checked={rolls === "10"}
                onChange={() => setRolls("10")}
                className="accent-[#FF8F1E]"
              />
              10 Makis — S/ {(maki.precio * 2 - 3).toFixed(2)}
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rolls"
                value="5"
                checked={rolls === "5"}
                onChange={() => setRolls("5")}
                className="accent-[#FF8F1E]"
              />
              5 Makis — S/ {maki.precio.toFixed(2)}
            </label>
          </div>
        </div>

        {/* ⚠️ Alergias */}
        <div className="mb-8">
          <h3 className="font-semibold text-[#2A2521] mb-3 text-lg">¿Eres alérgico?</h3>
          <div className="flex flex-col gap-3 text-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="alergico"
                value="No"
                checked={alergico === "No"}
                onChange={() => setAlergico("No")}
                className="accent-[#FF8F1E]"
              />
              No
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="alergico"
                value="Sí"
                checked={alergico === "Sí"}
                onChange={() => setAlergico("Sí")}
                className="accent-[#FF8F1E]"
              />
              Sí
            </label>
          </div>
        </div>

        {/* ➕➖ Control de cantidad */}
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
            className="w-12 h-12 bg-[#FF8F1E]/80 hover:bg-[#FF8F1E] text-white rounded-full text-2xl font-bold transition flex justify-center items-center"
          >
            <FiMinus />
          </button>
          <span className="text-2xl font-semibold text-[#2A2521]">{cantidad}</span>
          <button
            onClick={() => setCantidad((prev) => prev + 1)}
            className="w-12 h-12 bg-[#FF8F1E]/80 hover:bg-[#FF8F1E] text-white rounded-full text-2xl font-bold transition flex justify-center items-center"
          >
            <FiPlus />
          </button>
        </div>

        {/* 🟡 Botón Ordenar */}
        <button
          onClick={handleOrdenar}
          className="w-full bg-[#FF8F1E] hover:bg-[#e67d18] text-white font-bold text-lg py-4 rounded-full transition"
        >
          Ordenar 🍣
        </button>
      </div>
    </div>
  )
}