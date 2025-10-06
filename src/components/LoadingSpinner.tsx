export default function LoadingSpinner({ size = 'md', text = 'Cargando...' }: { size?: 'sm' | 'md' | 'lg', text?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-[#FF8F1E] border-t-transparent`}></div>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  )
}
