'use client'
import { useRef, useState, useCallback, useEffect } from 'react'

interface Props {
  src: string
  onCrop: (croppedBlob: Blob) => void
}

export function PhotoCropper({ src, onCrop }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [cropY, setCropY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)

  const PREVIEW_W = 300

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImage(img)
      const scale = PREVIEW_W / img.width
      const previewH = img.height * scale
      setCropY(Math.max(0, (previewH - PREVIEW_W) / 2))
    }
    img.src = src
  }, [src])

  useEffect(() => {
    if (!image || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!

    const scale = PREVIEW_W / image.width
    const previewH = Math.floor(image.height * scale)

    canvas.width = PREVIEW_W
    canvas.height = previewH

    ctx.drawImage(image, 0, 0, PREVIEW_W, previewH)

    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, PREVIEW_W, cropY)
    ctx.fillRect(0, cropY + PREVIEW_W, PREVIEW_W, previewH - cropY - PREVIEW_W)

    ctx.strokeStyle = '#2B5CE6'
    ctx.lineWidth = 2
    ctx.strokeRect(0, cropY, PREVIEW_W, PREVIEW_W)
  }, [image, cropY])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientY - cropY)
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !image || !canvasRef.current) return
      const scale = PREVIEW_W / image.width
      const previewH = image.height * scale
      const maxY = previewH - PREVIEW_W

      const newY = Math.max(0, Math.min(maxY, e.clientY - dragStart))
      setCropY(newY)
    },
    [isDragging, image, dragStart]
  )

  const handleCrop = () => {
    if (!image) return
    const scale = PREVIEW_W / image.width

    const realY = Math.floor(cropY / scale)
    const realSize = Math.floor(PREVIEW_W / scale)

    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = realSize
    outputCanvas.height = realSize
    const ctx = outputCanvas.getContext('2d')!

    ctx.drawImage(image, 0, realY, realSize, realSize, 0, 0, realSize, realSize)

    outputCanvas.toBlob(
      (blob) => { if (blob) onCrop(blob) },
      'image/jpeg',
      0.92
    )
  }

  if (!image) return <p className="text-sm text-gray-500">Завантаження...</p>

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">Перетягни рамку щоб вибрати область</p>
      <canvas
        ref={canvasRef}
        className="cursor-ns-resize rounded border"
        style={{ width: PREVIEW_W, maxWidth: '100%' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      />
      <button
        onClick={handleCrop}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        ✓ Use Photo
      </button>
    </div>
  )
}
