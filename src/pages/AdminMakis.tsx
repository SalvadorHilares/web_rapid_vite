import { useEffect, useState } from 'react'
import { getMakis, createMaki, updateMaki, deleteMaki } from '@/lib/api'
import { toast } from '@/components/Toaster'
import { ConfirmDialog, Modal } from '@/components/Modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

type Maki = { id: number; nombre: string; descripcion: string; precio: number }

export default function AdminMakis() {
  const [items, setItems] = useState<Maki[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [edit, setEdit] = useState<Maki | null>(null)
  const [del, setDel] = useState<Maki | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const load = () => {
    setLoading(true)
    getMakis()
      .then((rows) => setItems(Array.isArray(rows) ? rows as any : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin · Makis</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto">
          <div className="flex flex-col text-left">
            <label className="text-sm text-gray-600 mb-1">Buscar</label>
            <input className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm" placeholder="Nombre o descripción"
              value={search} onChange={(e) => { setPage(1); setSearch(e.target.value) }} />
          </div>
          <div />
          <div className="flex gap-2 items-end">
            <button className="h-10 px-4 rounded-md border text-sm bg-blue-50 hover:bg-blue-100" onClick={() => setCreateOpen(true)}>Nuevo</button>
            <select className="h-10 rounded-md border border-gray-300 px-2 text-sm bg-white" value={pageSize}
              onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)) }}>
              {[10,20,50,100].map(n => <option key={n} value={n}>{n}/pág</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre del Maki</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Precio (S/)</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginate(filterItems(items, search), page, pageSize).map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-xs">{i.id}</TableCell>
                  <TableCell className="font-medium">{i.nombre}</TableCell>
                  <TableCell className="text-gray-600">{i.descripcion}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-[#FF8F1E]">S/ {i.precio.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button 
                        className="h-8 px-3 rounded-md border text-xs bg-[#FF8F1E]/10 hover:bg-[#FF8F1E]/20 text-[#FF8F1E] border-[#FF8F1E]/30 transition-colors" 
                        onClick={() => setEdit(i)}
                      >
                        Editar
                      </button>
                      <button 
                        className="h-8 px-3 rounded-md border text-xs bg-red-50 hover:bg-red-100 text-red-600 border-red-200 transition-colors" 
                        onClick={() => setDel(i)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Paginación */}
      {filterItems(items, search).length > pageSize && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e: any) => { e.preventDefault(); if (page > 1) setPage(page - 1) }} className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
              </PaginationItem>
              {getPageNumbers(Math.ceil(filterItems(items, search).length / pageSize), page).map((p, i) => (
                <PaginationItem key={i}>
                  {p === 'ellipsis' ? <PaginationEllipsis /> : (
                    <PaginationLink href="#" isActive={p === page} onClick={(e: any) => { e.preventDefault(); setPage(p as number) }} className="cursor-pointer">{p}</PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e: any) => { e.preventDefault(); const tp = Math.ceil(filterItems(items, search).length / pageSize); if (page < tp) setPage(page + 1) }} className={page >= Math.ceil(filterItems(items, search).length / pageSize) ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Crear */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo maki" footer={<></>}>
        <MakiForm onSubmit={async (data) => { await createMaki(data as any); toast('Creado','success'); setCreateOpen(false); load() }} />
      </Modal>

      {/* Editar */}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Editar · #${edit?.id}`} footer={<></>}>
        {edit && <MakiForm initial={edit} onSubmit={async (data) => { await updateMaki(edit.id, data as any); toast('Actualizado','success'); setEdit(null); load() }} />}
      </Modal>

      {/* Eliminar */}
      <ConfirmDialog open={!!del} title={`Eliminar · #${del?.id}`} message="Esta acción no se puede deshacer" onCancel={() => setDel(null)} onConfirm={async () => { if (!del) return; await deleteMaki(del.id); toast('Eliminado','success'); setDel(null); load() }} />
    </div>
  )
}

function MakiForm({ initial, onSubmit }: { initial?: Partial<Maki>; onSubmit: (data: Partial<Maki>) => void }) {
  const [f, setF] = useState<Partial<Maki>>(initial ?? {})
  
  // Función para formatear números con comas
  const formatNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Función para limpiar números (quitar comas)
  const cleanNumber = (value: string) => {
    return value.replace(/,/g, '')
  }

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let processedValue = value
    
    // Formatear números con comas para el precio
    if (name === 'precio') {
      processedValue = formatNumber(value)
    }
    
    setF((prev) => ({ 
      ...prev, 
      [name]: name === 'precio' ? Number(cleanNumber(processedValue)) : processedValue 
    }))
  }
  
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); onSubmit(f) }}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Maki *</label>
        <input 
          placeholder="Ej: California Roll, Philadelphia Roll" 
          name="nombre" 
          className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8F1E] focus:border-[#FF8F1E]" 
          value={f.nombre ?? ''} 
          onChange={change} 
          required 
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/) *</label>
        <input 
          placeholder="18.50" 
          name="precio" 
          type="text" 
          className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8F1E] focus:border-[#FF8F1E]" 
          value={f.precio ? formatNumber(f.precio.toString()) : ''} 
          onChange={change} 
          required 
        />
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
        <input 
          placeholder="Ej: Delicioso roll de cangrejo con aguacate y pepino" 
          name="descripcion" 
          className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8F1E] focus:border-[#FF8F1E]" 
          value={f.descripcion ?? ''} 
          onChange={change} 
          required 
        />
      </div>
      
      <div className="md:col-span-2 flex justify-end gap-3 mt-4">
        <button 
          className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-[#FF8F1E] hover:bg-[#e67d18] transition-colors duration-200 shadow-sm" 
          type="submit"
        >
          Guardar Maki
        </button>
      </div>
    </form>
  )
}

function filterItems(items: Maki[], search: string) {
  const s = search.trim().toLowerCase()
  if (!s) return items
  return items.filter(i => (`${i.id} ${i.nombre} ${i.descripcion}`).toLowerCase().includes(s))
}

function paginate<T>(arr: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return arr.slice(start, start + pageSize)
}

function getPageNumbers(totalPages: number, current: number) {
  const pages: (number | 'ellipsis')[] = []
  if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); return pages }
  if (current <= 3) { return [1,2,3,4,'ellipsis', totalPages] }
  if (current >= totalPages - 2) { return [1,'ellipsis', totalPages-3, totalPages-2, totalPages-1, totalPages] }
  return [1,'ellipsis', current-1, current, current+1, 'ellipsis', totalPages]
}


