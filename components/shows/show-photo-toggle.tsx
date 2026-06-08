"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import { Camera } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ShowPhotoToggleProps {
  storagePath: string
}

export function ShowPhotoToggle({ storagePath }: ShowPhotoToggleProps) {
  const src = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/show-photos/${storagePath}`
  const [loaded, setLoaded] = useState(false)

  // Kick off the browser fetch on hover/focus so the image is likely cached by click time
  const preload = useCallback(() => {
    const img = new window.Image()
    img.src = src
  }, [src])

  return (
    <Dialog onOpenChange={() => setLoaded(false)}>
      <DialogTrigger
        className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
        onMouseEnter={preload}
        onFocus={preload}
      >
        <Camera className="h-4 w-4" />
        1 photo
      </DialogTrigger>
      <DialogContent
        className="p-0 overflow-hidden sm:max-w-3xl"
        showCloseButton={false}
      >
        <div className="relative w-full aspect-4/3 bg-muted">
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          <Image
            src={src}
            alt="Show photo"
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            className={`object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
