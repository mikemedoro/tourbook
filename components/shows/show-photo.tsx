"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import { Expand } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface ShowPhotoProps {
  storagePath: string
  alt: string
}

/**
 * The photo as the card's substrate: full-bleed at the top of the ticket,
 * clicking through to the full-size image.
 */
export function ShowPhoto({ storagePath, alt }: ShowPhotoProps) {
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
        className="group/photo relative block w-full cursor-pointer overflow-hidden bg-muted"
        onMouseEnter={preload}
        onFocus={preload}
        aria-label="View full-size photo"
      >
        <div className="relative aspect-16/10 w-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover transition-transform duration-500 group-hover/photo:scale-[1.03]"
          />
          {/* Warm scrim so the ticket body reads as a continuation of the photo */}
          <div className="absolute inset-0 bg-linear-to-t from-card/70 via-transparent to-transparent" />
          <span className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full bg-background/70 text-foreground opacity-0 backdrop-blur-xs transition-opacity group-hover/photo:opacity-100">
            <Expand className="size-3.5" />
          </span>
        </div>
      </DialogTrigger>

      <DialogContent className="overflow-hidden p-0 sm:max-w-3xl" showCloseButton={false}>
        <div className="relative aspect-4/3 w-full bg-muted">
          {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
          <Image
            src={src}
            alt={alt}
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
