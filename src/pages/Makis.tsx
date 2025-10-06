import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMaki } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/useAppStore'

export default function Makis() {
  const navigate = useNavigate()
  
  // Zustand store para cache de makis (solo los que necesitamos para render)
  const makis = useAppStore((state) => state.makis)
  const makisLoading = useAppStore((state) => state.makisLoading)
  const setMakis = useAppStore((state) => state.setMakis)
  const setMakisLoading = useAppStore((state) => state.setMakisLoading)
  const setMakisLoaded = useAppStore((state) => state.setMakisLoaded)
  
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const makiImages = [
    "/images/acevichado.jpg",
    "/images/california.jpeg",
    "/images/philadelphia.jpg",
  ]
  
  // Función para cargar makis (memoizada y estable como AdminOrders)
  const fetchMakis = useCallback(async () => {
    // Obtener valores actuales directamente del store
    const currentMakisLoaded = useAppStore.getState().makisLoaded
    
    // Si ya están cargados, no hacer nada
    if (currentMakisLoaded) {
      return
    }
    
    try {
      setMakisLoading(true)
      setLoadingProgress(0)
      
      // Optimización: cargar en lotes de 20 para mejor rendimiento
      const batchSize = 20
      const totalMakis = 200
      const allMakis = []
      
      for (let i = 0; i < totalMakis; i += batchSize) {
        const batch = []
        const promises = []
        
        // Crear promesas para el lote actual
        for (let j = i + 1; j <= Math.min(i + batchSize, totalMakis); j++) {
          promises.push(
            Promise.race([
              getMaki(j),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
              )
            ]).catch(err => {
              console.warn(`Error loading maki ${j}:`, err)
              return null // Retornar null para makis que fallan
            })
          )
        }
        
        // Esperar a que termine el lote
        const batchResults = await Promise.all(promises)
        batch.push(...batchResults.filter(maki => maki !== null))
        
        // Agregar al resultado total
        allMakis.push(...batch)
        
        // Actualizar progreso
        const progress = Math.round(((i + batchSize) / totalMakis) * 100)
        setLoadingProgress(progress)
        
        // Pequeña pausa entre lotes para no sobrecargar el servidor
        if (i + batchSize < totalMakis) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      // Guardar en cache de Zustand
      setMakis(allMakis)
      setMakisLoaded(true)
    } catch (err) {
      console.error('Error loading makis:', err)
      setMakis([])
      setMakisLoaded(false)
    } finally {
      setMakisLoading(false)
    }
  }, [setMakis, setMakisLoading, setMakisLoaded]) // Solo setters estables de Zustand

  // Cargar makis del backend de manera optimizada (solo si no están en cache)
  useEffect(() => {
    fetchMakis()
  }, [fetchMakis])

  // Filtrar makis por búsqueda
  const filteredMakis = makis.filter(maki => 
    maki.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    maki.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredMakis.length / itemsPerPage)
  const currentMakis = filteredMakis.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages))
  const prevPage = () => setPage((p) => Math.max(p - 1, 1))

  return (
        <div className="bg-[#FFF1EB] min-h-screen text-[#2A2521] pb-20">
          <section className="max-w-6xl mx-auto pt-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-2">Nuestros Makis</h1>
        <p className="text-[#FF8F1E] mb-10">Listado completo de makis 🍣</p>

        {/* 🔍 FILTROS */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          <Input
            placeholder="Buscar makis..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="w-full md:w-64"
          />
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setPage(1)
            }}
            className="h-10 w-full md:w-32 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={12}>12/pág</option>
            <option value={20}>20/pág</option>
            <option value={40}>40/pág</option>
          </select>
        </div>

            {makisLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-[#FF8F1E] border-t-transparent"></div>
                <p className="text-gray-600 text-sm">Cargando catálogo de makis...</p>
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#FF8F1E] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p className="text-gray-500 text-xs">{loadingProgress}% completado</p>
              </div>
            ) : filteredMakis.length === 0 ? (
              <p className="text-red-500 font-semibold">No se encontraron makis.</p>
            ) : (
          <>
            {/* 🧩 GRID DE MAKIS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {currentMakis.map((maki, index) => (
                <Card
                  key={maki.id}
                  className="bg-white rounded-3xl shadow-md overflow-hidden flex flex-col"
                >
                <img
                  src={makiImages[index % makiImages.length]}
                  alt={maki.nombre}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                  <CardContent className="p-5 flex flex-col items-center text-center flex-grow">
                    <h4 className="text-lg font-bold mb-2 uppercase">
                      {maki.nombre}
                    </h4>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {maki.descripcion}
                    </p>
                    <p className="text-[#2A2521] font-bold text-lg mb-4">
                      S/. {maki.precio.toFixed(2)}
                    </p>
                    <Button
                      onClick={() => navigate(`/makis/${maki.id}`)}
                      className="bg-[#FF8F1E] hover:bg-[#e67d18] text-white px-6 py-2 rounded-full font-medium transition flex items-center gap-2"
                    >
                      Ordenar 🍱
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 🔄 PAGINACIÓN */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                onClick={prevPage}
                disabled={page === 1}
                variant={page === 1 ? "outline" : "default"}
                className={page === 1 ? "cursor-not-allowed opacity-50" : "bg-[#FF8F1E] hover:bg-[#e67d18] text-white"}
              >
                ← Anterior
              </Button>
              <span className="text-[#2A2521] font-semibold">
                Página {page} de {totalPages}
              </span>
              <Button
                onClick={nextPage}
                disabled={page === totalPages}
                variant={page === totalPages ? "outline" : "default"}
                className={page === totalPages ? "cursor-not-allowed opacity-50" : "bg-[#FF8F1E] hover:bg-[#e67d18] text-white"}
              >
                Siguiente →
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}