'use client'

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Camera, Upload, X, ImageIcon, CheckCircle2 } from 'lucide-react'

interface ImageUploadProps {
  label: string
  required?: boolean
  value: string | null
  onChange: (base64: string | null) => void
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX_W = 1920
      const MAX_H = 1080
      let { width, height } = img
      if (width > MAX_W || height > MAX_H) {
        const ratio = Math.min(MAX_W / width, MAX_H / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = url
  })
}

export function ImageUpload({ label, required, value, onChange }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    const compressed = await compressImage(file)
    onChange(compressed)
  }, [onChange])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }, [handleFile])

  if (value) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-strata-ink">
            {label}{required && <span className="ml-0.5 text-red-500">*</span>}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-strata-green/10 px-2 py-1 text-[11px] font-semibold text-strata-green">
            <CheckCircle2 size={12} />
            Ready
          </span>
        </div>
        <div className="relative overflow-hidden rounded-lg border border-strata-green/40 bg-strata-bg">
          <img src={value} alt={label} className="h-52 w-full object-contain sm:h-60" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Remove ${label}`}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-white text-red-600 shadow-soft transition-colors hover:bg-red-50"
          >
            <X size={17} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-strata-ink">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </p>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex min-h-52 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-4 text-center transition-all',
          dragging
            ? 'border-strata-blue bg-strata-blue/5'
            : 'border-strata-line bg-white hover:border-strata-blue/50 hover:bg-strata-blue/5'
        )}
        onClick={() => fileRef.current?.click()}
      >
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-strata-bg text-strata-blue ring-1 ring-strata-line">
          <ImageIcon size={26} />
        </div>
        <div>
          <p className="text-sm font-semibold text-strata-ink">Add card image</p>
          <p className="mt-1 text-xs text-strata-muted">Use the camera or upload a clear photo.</p>
        </div>
        <div className="grid w-full max-w-xs grid-cols-2 gap-2">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); cameraRef.current?.click() }}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-strata-blue px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-strata-blue-dark"
          >
            <Camera size={14} />
            Camera
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-strata-line bg-white px-3 text-xs font-semibold text-strata-blue transition-colors hover:bg-strata-blue/5"
          >
            <Upload size={14} />
            Upload
          </button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onInputChange} />
    </div>
  )
}
