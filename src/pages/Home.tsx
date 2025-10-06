import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMaki } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAppStore } from '@/store/useAppStore'

export default function Home() {
  const navigate = useNavigate()
  
  // Zustand store para cache de makis (se obtienen directamente en fetchMakis)
  
  const [makis, setMakis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 🎲 Genera 3 IDs aleatorios del 1 al 200
  const getRandomIds = () => {
    const ids = new Set<number>()
    while (ids.size < 3) {
      ids.add(Math.floor(Math.random() * 200) + 1)
    }
    return Array.from(ids)
  }

  // Función para cargar makis recomendados (memoizada y estable como AdminOrders)
  const fetchMakis = useCallback(async () => {
    // Obtener valores actuales del store
    const currentMakisLoaded = useAppStore.getState().makisLoaded
    const currentMakisFromStore = useAppStore.getState().makis
    
    // Si ya hay makis en cache, usar esos
    if (currentMakisLoaded && currentMakisFromStore.length > 0) {
      const ids = getRandomIds()
      const randomMakis = currentMakisFromStore.filter(maki => ids.includes(maki.id))
      setMakis(randomMakis)
      setLoading(false)
      return
    }

    try {
      const ids = getRandomIds()
      // Optimización: hacer las llamadas en paralelo pero con timeout
      const requests = ids.map((id) => 
        Promise.race([
          getMaki(id),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ])
      )
      const data = await Promise.all(requests)
      setMakis(data)
    } catch (err) {
      console.error('Error loading makis:', err)
      // Fallback a datos por defecto en caso de error
      setMakis([
        {
          id: 1,
          nombre: "California Roll Premium",
          descripcion: "Delicioso roll de cangrejo con aguacate y pepino",
          precio: 18.99
        },
        {
          id: 2,
          nombre: "Philadelphia Roll",
          descripcion: "Roll de salmón con queso crema y cebollín",
          precio: 16.50
        },
        {
          id: 3,
          nombre: "Acevichado Roll",
          descripcion: "Roll de pescado fresco con leche de tigre",
          precio: 22.00
        }
      ])
    } finally {
      setLoading(false)
    }
  }, []) // Sin dependencias para evitar re-renders

  useEffect(() => {
    fetchMakis()
  }, [fetchMakis])

  // 🖼️ Imágenes locales para mejor rendimiento
  const makiImages = [
    "/images/acevichado.jpg",
    "/images/california.jpeg",
    "/images/philadelphia.jpg",
  ]

  return (
    <div
      className="relative bg-[#FFF1EB] text-[#2A2521] min-h-screen bg-no-repeat"
      style={{
        backgroundImage:
          "url('/images/flower-left.png'), url('/images/flower-right.png')",
        backgroundPosition: "left top 60px, right bottom 1050px",
        backgroundRepeat: "no-repeat",
        backgroundSize: "150px, 150px",
      }}
    >
      {/* 🍱 SECCIÓN PRINCIPAL */}
          <section className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-6 pt-16 pb-16">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Disfruta de un delicioso
            <span className="text-[#FF8F1E]"> Maki</span>
          </h2>
          <p className="text-gray-600 mb-6">
            Vive una experiencia única con nuestros makis preparados con ingredientes frescos y el mejor sabor japonés.
          </p>
          <Button
            onClick={() => navigate("/makis")}
            className="bg-[#FF8F1E] hover:bg-[#e67d18] text-white px-5 py-2 rounded-full font-medium transition"
          >
            Ver todos los makis →
          </Button>
        </div>
        <div className="flex-1 flex justify-center relative">
          <img src="/images/hero-sushi.png" alt="Hero Sushi" className="w-80 md:w-96" />
        </div>
      </section>

      {/* 🥢 SECCIÓN SOBRE NOSOTROS */}
      <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-6 py-16">
        <div className="flex-1">
          <img src="/images/about-sushi.png" alt="Sobre Nosotros" className="w-80 md:w-96 mx-auto md:mx-0" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-[#FF8F1E] font-semibold mb-2">Sobre Nosotros</h3>
          <h2 className="text-3xl font-bold mb-4">Ofrecemos comida saludable y deliciosa</h2>
          <p className="text-gray-700 leading-relaxed">
            En Maki Lover creemos que la comida no solo alimenta el cuerpo, sino también el alma. 
            Cada uno de nuestros makis es preparado con dedicación, respeto por los ingredientes 
            y pasión por la gastronomía japonesa.
          </p>
        </div>
      </section>

      {/* 🍣 SECCIÓN DE MAKIS RECOMENDADOS */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h3 className="text-[#FF8F1E] font-semibold mb-2 uppercase">Los Mejores Sabores</h3>
        <h2 className="text-3xl font-bold mb-10">Makis Recomendados</h2>

            {loading ? (
              <LoadingSpinner text="Cargando makis recomendados..." />
            ) : makis.length === 0 ? (
              <p className="text-red-500 font-semibold">No se pudieron obtener los makis recomendados.</p>
            ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {makis.map((maki, index) => (
              <Card
                key={maki.id}
                className="bg-white rounded-3xl shadow hover:shadow-lg transition p-6 flex flex-col items-center"
              >
                <CardContent className="flex flex-col items-center p-0">
                      <img
                        src={makiImages[index % makiImages.length]}
                        alt={maki.nombre}
                        className="h-40 w-40 object-cover rounded-full mb-4"
                        loading="lazy"
                        decoding="async"
                      />
                  <h4 className="text-lg font-semibold">{maki.nombre}</h4>
                  <p className="text-gray-500 text-sm mb-2 text-center">
                    {maki.descripcion}
                  </p>
                  <p className="text-[#FF8F1E] font-bold text-lg mb-4">
                    S/. {maki.precio.toFixed(2)}
                  </p>

                  {/* 🟡 BOTÓN ORDENAR */}
                  <Button
                    onClick={() => navigate(`/makis/${maki.id}`)}
                    className="bg-[#FF8F1E] hover:bg-[#e67d18] text-white px-5 py-2 rounded-full font-medium transition"
                  >
                    Ordenar 🍣
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}


