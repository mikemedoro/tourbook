"use client"

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

  return (
    <Dialog>
      <DialogTrigger className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
        <Camera className="h-4 w-4" />
        1 photo
      </DialogTrigger>
      <DialogContent
        className="p-0 overflow-hidden sm:max-w-3xl"
        showCloseButton={false}
      >
        <div className="relative w-full aspect-4/3">
          <Image
            src={src}
            alt="Show photo"
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
