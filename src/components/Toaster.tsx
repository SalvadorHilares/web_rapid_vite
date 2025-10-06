import { useEffect, useState } from 'react'

type Toast = { id: number; title: string; variant?: 'success' | 'error' | 'info' }

let listeners: ((t: Toast) => void)[] = []
let counter = 1

export function toast(title: string, variant: Toast['variant'] = 'info') {
  const t: Toast = { id: counter++, title, variant }
  listeners.forEach((fn) => fn(t))
}

export default function Toaster() {
  const [items, setItems] = useState<Toast[]>([])

  useEffect(() => {
    const onPush = (t: Toast) => {
      setItems((prev) => [...prev, t])
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id))
      }, 3000)
    }
    listeners.push(onPush)
    return () => { listeners = listeners.filter((l) => l !== onPush) }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {items.map((t) => (
        <div key={t.id} className={`min-w-[220px] rounded-md border px-3 py-2 text-sm shadow bg-white ${
          t.variant === 'success' ? 'border-green-300' : t.variant === 'error' ? 'border-red-300' : 'border-gray-300'}`}>
          {t.title}
        </div>
      ))}
    </div>
  )
}


