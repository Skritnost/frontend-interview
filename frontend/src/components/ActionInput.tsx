import { useRef, useEffect } from 'react'
import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

interface ActionInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onBlur?: () => void
  placeholder?: string
  label?: string
  icon: ReactNode
  loading?: boolean
  disabled?: boolean
  error?: string
  refocusAfterLoading?: boolean
}

export default function ActionInput({
  value,
  onChange,
  onSubmit,
  onBlur,
  placeholder,
  label,
  icon,
  loading,
  disabled,
  error,
  refocusAfterLoading,
}: ActionInputProps) {
  const isDisabled = disabled || loading
  const inputRef = useRef<HTMLInputElement>(null)
  const wasLoading = useRef(false)

  useEffect(() => {
    if (refocusAfterLoading && wasLoading.current && !loading) {
      inputRef.current?.focus()
    }
    wasLoading.current = !!loading
  }, [loading, refocusAfterLoading])

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div
        className="flex items-center border-2 border-black rounded-full pl-4 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-black/20 transition-shadow"
        onBlur={(e) => {
          if (onBlur && !e.currentTarget.contains(e.relatedTarget as Node)) {
            onBlur()
          }
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !isDisabled && onSubmit()}
          placeholder={placeholder}
          disabled={isDisabled}
          className="flex-1 outline-none bg-transparent text-sm disabled:opacity-50"
        />
        <button
          onClick={() => {
            onSubmit()
            inputRef.current?.focus()
          }}
          disabled={isDisabled}
          className="ml-2 flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <LoaderCircle className="w-4 h-4 animate-spin" />
          ) : (
            icon
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1 ml-4">{error}</p>}
    </div>
  )
}
