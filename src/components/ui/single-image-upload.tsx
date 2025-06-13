import React, { useState, useCallback } from 'react'
import { X, Link, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/utils'

interface SingleImageUploadProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function SingleImageUpload({
  value = '',
  onChange,
  placeholder = "Upload image or enter URL",
  className,
  disabled = false,
}: SingleImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      onChange(url)
    }
  }, [onChange, disabled])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    
    if (disabled) return

    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      onChange(url)
    }
    
    // Reset the input value so the same file can be selected again
    e.target.value = ''
  }, [onChange, disabled])

  const handleUrlAdd = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput('')
      setShowUrlInput(false)
    }
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Image Display */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-image.jpg'
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Area (only show when no image) */}
      {!value && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "hover:border-primary/50 cursor-pointer"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div className="space-y-2">
            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">{placeholder}</p>
              <p>Drag & drop or click to browse</p>
              <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>
      )}

      {/* URL Input Section */}
      {!value && (
        <div className="space-y-2">
          {!showUrlInput ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(true)}
              disabled={disabled}
              className="w-full"
            >
              <Link className="h-4 w-4 mr-2" />
              Or enter image URL
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={disabled}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleUrlAdd()
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleUrlAdd}
                disabled={disabled || !urlInput.trim()}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowUrlInput(false)
                  setUrlInput('')
                }}
                disabled={disabled}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 