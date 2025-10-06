import { type ReactNode } from 'react'

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 transform transition-all duration-300 scale-100">
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#FF8F1E] to-[#e67d18] text-white font-semibold text-lg rounded-t-xl">
            {title}
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, title = 'Confirmar', message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel }:
  { open: boolean; title?: string; message: string; confirmText?: string; cancelText?: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} footer={
      <>
        <button 
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200" 
          onClick={onCancel}
        >
          {cancelText}
        </button>
        <button 
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 shadow-sm" 
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </>
    }>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-700 leading-relaxed">{message}</p>
      </div>
    </Modal>
  )
}


