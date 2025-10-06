import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/Toaster'
import { createOrder, createUser, getUsers } from '@/lib/api'

interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  opcion: string;
  alergico: string;
}

export default function Carrito() {
  const navigate = useNavigate()
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [recibePromos, setRecibePromos] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    documento: 'dni',
    numero: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    receptor: '',
    comprobante: 'boleta',
    tipo: 'simple'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 🔄 Solo ejecuta en cliente (evita errores de SSR)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 🛒 Cargar carrito desde localStorage
  useEffect(() => {
    if (mounted) {
      try {
        const stored = localStorage.getItem("carrito")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) setCarrito(parsed)
        }
      } catch (error) {
        console.error("Error leyendo el carrito:", error)
      }
    }
  }, [mounted])

  // 🧮 Calcular total
  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  const handleCantidad = (id: number, delta: number) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.max(1, item.cantidad + delta) }
          : item
      )
    )
  }

  // 💾 Guardar cambios al localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("carrito", JSON.stringify(carrito))
    }
  }, [carrito, mounted])

  // Función para formatear números con comas
  const formatNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Función para limpiar números (quitar comas)
  const cleanNumber = (value: string) => {
    return value.replace(/,/g, '')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }
    
    if (!formData.numero) {
      newErrors.numero = 'El número de documento es requerido'
    } else {
      const cleanNum = cleanNumber(formData.numero)
      if (formData.documento === 'dni' && !/^\d{8}$/.test(cleanNum)) {
        newErrors.numero = 'El DNI debe tener 8 dígitos'
      }
    }
    
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos'
    } else if (formData.nombres.trim().length < 2) {
      newErrors.nombres = 'Los nombres deben tener al menos 2 caracteres'
    }
    
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos'
    } else if (formData.apellidos.trim().length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres'
    }
    
    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es requerido'
    } else {
      const cleanTel = cleanNumber(formData.telefono)
      if (!/^\d{9}$/.test(cleanTel)) {
        newErrors.telefono = 'El teléfono debe tener 9 dígitos'
      }
    }
    
    if (!formData.receptor.trim()) {
      newErrors.receptor = 'El nombre del receptor es requerido'
    } else if (formData.receptor.trim().length < 2) {
      newErrors.receptor = 'El nombre del receptor debe tener al menos 2 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value
    
    // Formatear números con comas para documento y teléfono
    if (field === 'numero' || field === 'telefono') {
      processedValue = formatNumber(value)
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handlePagar = async () => {
    if (!aceptaTerminos) {
      toast('Debes aceptar los términos y condiciones', 'error')
      return
    }
    
    if (!validateForm()) {
      toast('Por favor corrige los errores en el formulario', 'error')
      return
    }
    
    if (carrito.length === 0) {
      toast('Tu carrito está vacío', 'error')
      return
    }
    
    setProcessing(true)
    
    try {
      // 1. Obtener usuarios existentes (para evitar crear duplicados)
      const usuarios = await getUsers()
      
      let usuarioId = 1 // Usar usuario por defecto
      
          // 2. Intentar crear usuario o usar existente
          try {
            const nuevoUsuario = await createUser({
              name: `${formData.nombres} ${formData.apellidos}`,
              email: formData.email,
              phone_number: cleanNumber(formData.telefono),
              address: formData.receptor
            })
        
        usuarioId = nuevoUsuario.id || nuevoUsuario.user_id || 1
        
      } catch (error) {
        // ✅ VERIFICAR SI ES ERROR DE EMAIL DUPLICADO
        if ((error as any).status === 400 && (error as any).response?.data?.detail === "Email already exists") {
          // Buscar usuario existente por email
          const usuarioExistente = usuarios.find(u => u.email === formData.email)
          
          if (usuarioExistente) {
            usuarioId = usuarioExistente.id
          } else {
            // Si no se encuentra, usar el último usuario creado (ID 103)
            usuarioId = usuarios[usuarios.length - 1].id
          }
        } else {
          // Fallback a usuario por defecto
          usuarioId = 1
        }
      }
      
      // 3. Crear órdenes usando el microservicio menu (Spring Boot)
      // Los makis vienen del microservicio menu, no orders
      const ordenesCreadas = []
      
      for (const item of carrito) {
        const orden = await createOrder({
          user_id: usuarioId,
          product_id: item.id, // ID del maki del microservicio menu
          status: 'pending',
          total_price: item.precio * item.cantidad,
          payment_method: formData.comprobante === 'boleta' ? 'cash' : 'card'
        })
        ordenesCreadas.push(orden)
      }
      
      toast(`¡Pedido realizado con éxito! Usuario: ${formData.nombres} ${formData.apellidos}. Se crearon ${ordenesCreadas.length} órdenes.`, 'success')
      
      // Limpiar carrito y formulario
      setCarrito([])
      localStorage.removeItem('carrito')
      setFormData({
        email: '',
        documento: 'dni',
        numero: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        receptor: '',
        comprobante: 'boleta',
        tipo: 'simple'
      })
      
      // Redirigir a admin orders para ver las órdenes creadas
      navigate('/admin/orders')
      
    } catch (error) {
      console.error('Error creating user/order:', error)
      toast('Error al crear el pedido. Inténtalo de nuevo.', 'error')
    } finally {
      setProcessing(false)
    }
  }

  if (!mounted) return null // ⚠️ Evita render hasta que el cliente esté listo

  return (
    <div className="bg-[#FFF1EB] min-h-screen p-10 text-[#2A2521] flex flex-col lg:flex-row gap-10 justify-center">
      {/* 🧾 DATOS DEL COMPRADOR */}
      <Card className="flex-1 max-w-2xl">
        <CardHeader>
          <h2 className="text-xl font-bold">DATOS DEL COMPRADOR</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo Electrónico *</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="ejemplo@correo.com" 
                className={`rounded-full ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="documento" className="text-sm font-medium text-gray-700">Tipo de Documento</Label>
              <select 
                className="h-10 w-full rounded-full border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8F1E] focus:border-[#FF8F1E]"
                value={formData.documento}
                onChange={(e) => handleInputChange('documento', e.target.value)}
              >
                <option value="dni">DNI</option>
                <option value="ce">Carné de Extranjería</option>
              </select>
            </div>
            <div>
              <Label htmlFor="numero" className="text-sm font-medium text-gray-700">Número de Documento *</Label>
              <Input 
                id="numero" 
                type="text"
                placeholder="12345678" 
                className={`rounded-full ${errors.numero ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
              />
              {errors.numero && <p className="text-red-500 text-sm mt-1">{errors.numero}</p>}
            </div>
            <div>
              <Label htmlFor="nombres" className="text-sm font-medium text-gray-700">Nombres *</Label>
              <Input 
                id="nombres" 
                type="text"
                placeholder="Juan Carlos" 
                className={`rounded-full ${errors.nombres ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.nombres}
                onChange={(e) => handleInputChange('nombres', e.target.value)}
              />
              {errors.nombres && <p className="text-red-500 text-sm mt-1">{errors.nombres}</p>}
            </div>
            <div>
              <Label htmlFor="apellidos" className="text-sm font-medium text-gray-700">Apellidos *</Label>
              <Input 
                id="apellidos" 
                type="text"
                placeholder="Pérez García" 
                className={`rounded-full ${errors.apellidos ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.apellidos}
                onChange={(e) => handleInputChange('apellidos', e.target.value)}
              />
              {errors.apellidos && <p className="text-red-500 text-sm mt-1">{errors.apellidos}</p>}
            </div>
            <div>
              <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">Teléfono Celular *</Label>
              <Input 
                id="telefono" 
                type="tel"
                placeholder="987,654,321" 
                className={`rounded-full ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
              />
              {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4 text-gray-800">DATOS DE QUIEN RECIBE</h3>
            <div>
              <Label htmlFor="receptor" className="text-sm font-medium text-gray-700">Nombre Completo del Receptor *</Label>
              <Input 
                id="receptor"
                type="text"
                placeholder="María González López" 
                className={`rounded-full ${errors.receptor ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.receptor}
                onChange={(e) => handleInputChange('receptor', e.target.value)}
              />
              {errors.receptor && <p className="text-red-500 text-sm mt-1">{errors.receptor}</p>}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">TIPO DE ENTREGA</h3>
            <p className="text-sm text-gray-700 mb-1">Recojo en tienda:</p>
            <Button variant="outline" className="border-[#FF8F1E] text-[#2A2521] hover:bg-[#FF8F1E] hover:text-white rounded-full">
              Cambiar
            </Button>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">LOCAL:</h3>
            <p className="text-sm text-gray-700">
              SAN MIGUEL | Plaza San Miguel, Lima - Perú
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">COMPROBANTE DE PAGO</h3>
            <div className="flex gap-6 items-center mb-3">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="comprobante" 
                  value="boleta"
                  checked={formData.comprobante === 'boleta'}
                  onChange={(e) => handleInputChange('comprobante', e.target.value)}
                /> Boleta
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="comprobante" 
                  value="factura"
                  checked={formData.comprobante === 'factura'}
                  onChange={(e) => handleInputChange('comprobante', e.target.value)}
                /> Factura
              </label>
            </div>
            <select 
              className="h-10 w-full rounded-full border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={formData.tipo}
              onChange={(e) => handleInputChange('tipo', e.target.value)}
            >
              <option value="simple">Simple</option>
              <option value="detallada">Detallada</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 🛒 RESUMEN DEL PEDIDO */}
      <Card className="w-full max-w-md sticky top-4 h-fit bg-[#F5F5F5]">
        <CardHeader>
          <h2 className="text-xl font-bold">TU PEDIDO</h2>
        </CardHeader>
        <CardContent>
          {carrito.length === 0 ? (
            <p className="text-gray-500">Tu carrito está vacío.</p>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="flex gap-4 mb-6 border-b pb-4">
                <img src={item.imagen} alt={item.nombre} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.nombre}</h3>
                  <p className="text-sm text-gray-500">{item.opcion}</p>
                  <p className="text-sm text-gray-500">Alérgico: {item.alergico}</p>
                  <div className="flex items-center mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 rounded-full p-0"
                      onClick={() => handleCantidad(item.id, -1)}
                    >
                      -
                    </Button>
                    <span className="mx-3">{item.cantidad}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 rounded-full p-0"
                      onClick={() => handleCantidad(item.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="text-right font-semibold">
                  S/ {(item.precio * item.cantidad).toFixed(2)}
                </div>
              </div>
            ))
          )}

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-semibold text-gray-800">
              <span>Total</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={() => setAceptaTerminos(!aceptaTerminos)}
              />
              Acepto los <span className="font-semibold">Términos y Condiciones</span>.
            </label>
            <label className="flex items-center gap-2 text-sm mt-2">
              <input
                type="checkbox"
                checked={recibePromos}
                onChange={() => setRecibePromos(!recibePromos)}
              />
              Autorizo recibir promociones.
            </label>
          </div>

              <Button
                onClick={handlePagar}
                disabled={!aceptaTerminos || processing}
                className={`w-full mt-6 py-3 rounded-full text-white font-semibold transition ${
                  aceptaTerminos && !processing
                    ? "bg-[#FF8F1E] hover:bg-[#e67d18]"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {processing ? 'PROCESANDO...' : 'PAGAR'}
              </Button>
        </CardContent>
      </Card>
    </div>
  )
}