"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import Image from "next/image"
import { Button, buttonVariants } from "@/components/ui/button"
import { FormActions } from "@/components/ui/form-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/shows/star-rating"
import { createClient } from "@/lib/supabase/client"
import { ShowPhoto, ShowWithRelations } from "@/types/database"
import { Loader2, RefreshCw, Trash2, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const schema = z.object({
  show_date: z.string().min(1, "Date is required"),
  other_acts: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
})

type FormValues = z.infer<typeof schema>

interface EditShowFormProps {
  show: ShowWithRelations
  username: string
}

export function EditShowForm({ show, username }: EditShowFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [highlighted, setHighlighted] = useState<Set<string>>(
    new Set(show.setlist_songs.filter((s) => s.is_highlighted).map((s) => s.id))
  )
  const [existingPhotos, setExistingPhotos] = useState<ShowPhoto[]>(show.show_photos)
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])
  const [overallRating, setOverallRating] = useState(show.overall_rating ?? 0)
  const [soundRating, setSoundRating] = useState(show.sound_rating ?? 0)
  const [crowdRating, setCrowdRating] = useState(show.crowd_rating ?? 0)
  const [setlistRating, setSetlistRating] = useState(show.setlist_rating ?? 0)
  const [venueRating, setVenueRating] = useState(show.venue_rating ?? 0)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loadingOtherActs, setLoadingOtherActs] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      show_date: show.show_date,
      other_acts: show.other_acts ?? "",
      notes: show.notes ?? "",
    },
  })

  function fetchOtherActs() {
    if (!show.setlist_id) return
    setLoadingOtherActs(true)
    fetch(
      `/api/setlistfm/venue-setlists?setlistId=${show.setlist_id}&exclude=${encodeURIComponent(show.artist_name)}`
    )
      .then((r) => r.json())
      .then((data: { other_acts: string[] }) => {
        setValue("other_acts", data.other_acts.join(", "))
      })
      .catch(() => {})
      .finally(() => setLoadingOtherActs(false))
  }

  function toggleHighlight(songId: string) {
    setHighlighted((prev) => {
      const next = new Set(prev)
      if (next.has(songId)) next.delete(songId)
      else next.add(songId)
      return next
    })
  }

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from("shows").delete().eq("id", show.id)
    if (error) {
      toast.error("Failed to delete show.")
      setDeleting(false)
      return
    }
    toast.success("Show deleted.")
    router.push(`/profile/${username}`)
    router.refresh()
  }

  async function handleDeletePhoto(photo: ShowPhoto) {
    const { error: storageError } = await supabase.storage
      .from("show-photos")
      .remove([photo.storage_path])
    if (storageError) {
      toast.error("Failed to delete photo.")
      return
    }
    await supabase.from("show_photos").delete().eq("id", photo.id)
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id))
  }

  function handleNewPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const slots = 1 - existingPhotos.length
    setNewPhotoFiles(Array.from(e.target.files).slice(0, slots))
  }

  async function onSubmit(values: FormValues) {
      setSaving(true)

      try {
        const { error: showError } = await supabase
          .from("shows")
          .update({
            show_date: values.show_date,
            overall_rating: overallRating || null,
            sound_rating: soundRating || null,
            crowd_rating: crowdRating || null,
            setlist_rating: setlistRating || null,
            venue_rating: venueRating || null,
            notes: values.notes || null,
            other_acts: values.other_acts?.trim() || null,
          })
          .eq("id", show.id)

        if (showError) throw new Error(showError.message)

        // Update highlighted state for each song
        for (const song of show.setlist_songs) {
          const isHighlighted = highlighted.has(song.id)
          if (isHighlighted !== song.is_highlighted) {
            await supabase
              .from("setlist_songs")
              .update({ is_highlighted: isHighlighted })
              .eq("id", song.id)
          }
        }

        // Upload new photos
        if (newPhotoFiles.length > 0) {
          const paths: string[] = []
          for (const file of newPhotoFiles) {
            const ext = file.name.split(".").pop()
            const path = `${show.user_id}/${show.id}/${crypto.randomUUID()}.${ext}`
            const { error } = await supabase.storage.from("show-photos").upload(path, file, { contentType: file.type })
            if (error) toast.error(`Photo upload failed: ${error.message}`)
            else paths.push(path)
          }
          if (paths.length > 0) {
            await supabase.from("show_photos").insert(paths.map((p) => ({ show_id: show.id, storage_path: p })))
          }
        }

        toast.success("Show updated.")
        router.push(`/profile/${username}`)
        router.refresh()
      } catch (err) {
        toast.error((err as Error).message ?? "Failed to update show.")
      } finally {
        setSaving(false)
      }
  }

  const ratings: [string, number, (v: number) => void][] = [
    ["Overall", overallRating, setOverallRating],
    ["Sound", soundRating, setSoundRating],
    ["Setlist", setlistRating, setSetlistRating],
    ["Venue", venueRating, setVenueRating],
    ["Crowd", crowdRating, setCrowdRating],
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Show info (read-only) */}
      <div className="flex flex-col gap-1.5 border-l-2 border-primary pl-3">
        <h2 className="font-heading text-xl leading-tight font-bold tracking-[-0.02em] uppercase">
          {show.artist_name}
        </h2>
        <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
          {show.venue_name} · {show.venue_city}
          {show.venue_state ? `, ${show.venue_state}` : ""}
        </p>
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="show_date">Show date *</Label>
        <Input id="show_date" type="date" {...register("show_date")} />
        {errors.show_date && (
          <p className="text-destructive text-xs">{errors.show_date.message}</p>
        )}
      </div>

      {/* Highlighted songs */}
      {show.setlist_songs.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label>Highlighted songs</Label>
            <p className="text-xs text-muted-foreground">
              Click a song to toggle its highlight
            </p>
            <div className="flex flex-wrap gap-2">
              {show.setlist_songs
                .sort((a, b) => a.position - b.position)
                .map((song) => (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => toggleHighlight(song.id)}
                  >
                    <Badge variant={highlighted.has(song.id) ? "default" : "outline"} className="max-w-75">
                      <span className="truncate min-w-0">{song.song_name}</span>
                    </Badge>
                  </button>
                ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Ratings */}
      <div className="flex flex-col gap-4">
        <Label>Ratings</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ratings.map(([label, value, onChange]) => (
            <div key={label} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{label}</span>
              <StarRating value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={4}
          placeholder="How was the show?"
          {...register("notes")}
        />
      </div>

      <Separator />

      {/* Other acts */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="other_acts">Other acts</Label>
        <div className="flex gap-2">
          <Input
            id="other_acts"
            placeholder="e.g. Pixies, Oasis"
            {...register("other_acts")}
          />
          {show.setlist_id && (
            <button
              type="button"
              onClick={fetchOtherActs}
              disabled={loadingOtherActs}
              className="shrink-0 flex items-center justify-center rounded-md border px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              title="Fetch other acts from Setlist.fm"
            >
              {loadingOtherActs
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <RefreshCw className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      <Separator />

      {/* Photos */}
      <div className="flex flex-col gap-2">
        <Label>Photos</Label>
        {existingPhotos.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {existingPhotos.map((photo) => (
              <div key={photo.id} className="relative h-24 w-32 rounded-md overflow-hidden group">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/show-photos/${photo.storage_path}`}
                  alt="Show photo"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        {existingPhotos.length < 1 && (
          <div className="flex flex-col gap-1">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewPhotoChange}
            />
            <p className="text-xs text-muted-foreground">
              {1 - existingPhotos.length} slot{1 - existingPhotos.length !== 1 ? "s" : ""} remaining
            </p>
          </div>
        )}
      </div>

      <FormActions
        destructive={
          <AlertDialog>
            <AlertDialogTrigger
              type="button"
              className={buttonVariants({ variant: "destructive" })}
              disabled={saving || deleting}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this show?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{show.artist_name}</strong> at{" "}
                  {show.venue_name}. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className={buttonVariants({ variant: "destructive-solid" })}
                >
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete show
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      >
        <Button type="submit" disabled={saving || deleting}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving || deleting}
        >
          Cancel
        </Button>
      </FormActions>
    </form>
  )
}
