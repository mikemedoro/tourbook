"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FormActions } from "@/components/ui/form-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArtistSearch } from "@/components/shows/artist-search"
import { SetlistPicker } from "@/components/shows/setlist-picker"
import { SongHighlighter } from "@/components/shows/song-highlighter"
import { StarRating } from "@/components/shows/star-rating"
import { createClient } from "@/lib/supabase/client"
import { SetlistFmArtist, SetlistFmSetlist } from "@/types/setlistfm"
import { Loader2, RefreshCw } from "lucide-react"

const schema = z.object({
  show_date: z.string().min(1, "Date is required"),
  venue_name: z.string().min(1, "Venue name is required"),
  venue_city: z.string().min(1, "City is required"),
  venue_state: z.string().optional(),
  venue_country: z.string().optional(),
  other_acts: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
})

type FormValues = z.infer<typeof schema>

interface LogShowFormProps {
  userId: string
}

interface FlatSong {
  name: string
  isEncore: boolean
}

export function LogShowForm({ userId }: LogShowFormProps) {
  const router = useRouter()
  const supabase = createClient()

  // Artist state
  const [selectedArtist, setSelectedArtist] = useState<SetlistFmArtist | null>(null)

  // Setlist state
  const [selectedSetlist, setSelectedSetlist] = useState<SetlistFmSetlist | null>(null)
  const [songs, setSongs] = useState<FlatSong[]>([])
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())

  // Ratings
  const [overallRating, setOverallRating] = useState(0)
  const [soundRating, setSoundRating] = useState(0)
  const [crowdRating, setCrowdRating] = useState(0)
  const [setlistRating, setSetlistRating] = useState(0)
  const [venueRating, setVenueRating] = useState(0)

  // Precise venue coords (geocoded from venue name+city)
  const [venueCoords, setVenueCoords] = useState<{ lat: number; lng: number } | null>(null)

  // Photos
  const [photos, setPhotos] = useState<File[]>([])

  // Other acts auto-fetch state
  const [loadingOtherActs, setLoadingOtherActs] = useState(false)

  // Submission state
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { show_date: "", venue_name: "", venue_city: "", venue_state: "", venue_country: "", other_acts: "", notes: "" },
  })

  function handleArtistSelect(artist: SetlistFmArtist) {
    setSelectedArtist(artist)
    setSelectedSetlist(null)
    setSongs([])
    setHighlighted(new Set())
  }

  function handleSetlistSelect(setlist: SetlistFmSetlist) {
    setSelectedSetlist(setlist)
    setVenueCoords(null)
    const [d, m, y] = setlist.eventDate.split("-")
    setValue("show_date", `${y}-${m}-${d}`)
    setValue("venue_name", setlist.venue.name)
    setValue("venue_city", setlist.venue.city.name)
    setValue("venue_state", setlist.venue.city.state ?? "")
    setValue("venue_country", setlist.venue.city.country.name)

    // Flatten songs from all sets
    const flat: FlatSong[] = []
    for (const set of setlist.sets.set) {
      const isEncore = typeof set.encore === "number" && set.encore > 0
      for (const song of set.song) {
        flat.push({ name: song.name, isEncore })
      }
    }
    setSongs(flat)
    setHighlighted(new Set())

    // Auto-fetch other acts (other artists at the same venue on the same date)
    fetchOtherActs(setlist.venue.id, setlist.eventDate, setlist.artist.name)

    // Geocode the venue via server-side Nominatim proxy for precise coordinates
    if (setlist.venue.name) {
      const params = new URLSearchParams({
        name: setlist.venue.name,
        city: setlist.venue.city.name,
      })
      fetch(`/api/geocode?${params}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.lat && data?.lng) {
            setVenueCoords({ lat: data.lat, lng: data.lng })
          }
        })
        .catch(() => {})
    }
  }

  function toggleHighlight(songName: string) {
    setHighlighted((prev) => {
      const next = new Set(prev)
      if (next.has(songName)) {
        next.delete(songName)
      } else {
        next.add(songName)
      }
      return next
    })
  }

  function fetchOtherActs(venueId: string, date: string, excludeArtist: string) {
    setLoadingOtherActs(true)
    fetch(
      `/api/setlistfm/venue-setlists?venueId=${venueId}&date=${date}&exclude=${encodeURIComponent(excludeArtist)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.other_acts?.length > 0) {
          setValue("other_acts", data.other_acts.join(", "))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingOtherActs(false))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, 1)
    setPhotos(files)
  }

  async function uploadPhotos(showId: string): Promise<string[]> {
    const paths: string[] = []
    for (const file of photos) {
      const ext = file.name.split(".").pop()
      const path = `${userId}/${showId}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from("show-photos").upload(path, file, {
        contentType: file.type,
      })
      if (error) {
        console.error("Photo upload failed:", error.message)
        toast.error(`Photo upload failed: ${error.message}`)
      } else {
        paths.push(path)
      }
    }
    return paths
  }

  const onSubmit = useCallback(
    async (values: FormValues) => {
      if (!selectedArtist) {
        toast.error("Please select an artist.")
        return
      }

      // Geocode if we don't have precise coords yet (manual entry path)
      let coords = venueCoords
      if (!coords && values.venue_name && values.venue_city) {
        try {
          const params = new URLSearchParams({ name: values.venue_name, city: values.venue_city })
          const r = await fetch(`/api/geocode?${params}`)
          const data = await r.json()
          if (data?.lat && data?.lng) coords = { lat: data.lat, lng: data.lng }
        } catch {}
      }

      const venueData = {
        venue_name: values.venue_name,
        venue_city: values.venue_city,
        venue_state: values.venue_state || "",
        venue_country: values.venue_country || "",
        venue_lat: coords?.lat ?? selectedSetlist?.venue.city.coords?.lat ?? null,
        venue_lng: coords?.lng ?? selectedSetlist?.venue.city.coords?.long ?? null,
      }

      setSaving(true)

      try {
        // Insert show
        const { data: show, error: showError } = await supabase
          .from("shows")
          .insert({
            user_id: userId,
            artist_name: selectedArtist.name,
            artist_mbid: selectedArtist.mbid,
            ...venueData,
            show_date: values.show_date,
            setlist_id: selectedSetlist?.id ?? null,
            overall_rating: overallRating || null,
            sound_rating: soundRating || null,
            crowd_rating: crowdRating || null,
            setlist_rating: setlistRating || null,
            venue_rating: venueRating || null,
            notes: values.notes ?? null,
            other_acts: values.other_acts?.trim() || null,
          })
          .select("id")
          .single()

        if (showError || !show) {
          throw new Error(showError?.message ?? "Failed to save show")
        }

        // Insert songs
        if (songs.length > 0) {
          const songRows = songs.map((song, i) => ({
            show_id: show.id,
            song_name: song.name,
            position: i + 1,
            is_encore: song.isEncore,
            is_highlighted: highlighted.has(song.name),
          }))
          await supabase.from("setlist_songs").insert(songRows)
        }

        // Upload photos
        if (photos.length > 0) {
          const paths = await uploadPhotos(show.id)
          if (paths.length > 0) {
            await supabase.from("show_photos").insert(
              paths.map((path) => ({ show_id: show.id, storage_path: path }))
            )
          }
        }

        toast.success("Show logged.")
        router.push("/feed")
        router.refresh()
      } catch (err) {
        toast.error((err as Error).message)
      } finally {
        setSaving(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedArtist,
      selectedSetlist,
      songs,
      highlighted,
      overallRating,
      soundRating,
      crowdRating,
      setlistRating,
      venueRating,
      photos,
      userId,
    ]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Artist */}
      <div className="flex flex-col gap-2">
        <Label>Artist *</Label>
        <ArtistSearch onSelect={handleArtistSelect} />
      </div>

      {/* Import from Setlist.fm (optional) */}
      {selectedArtist && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <div>
              <Label>Import from Setlist.fm <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <p className="text-xs text-muted-foreground mt-1">
                Select a past setlist to auto-fill the date, venue, and songs.
              </p>
            </div>
            <SetlistPicker mbid={selectedArtist.mbid} onSelect={handleSetlistSelect} />
          </div>
        </>
      )}

      {/* Date + Venue */}
      {selectedArtist && (
        <>
          <Separator />
          <div className="flex flex-col gap-3">
            <Label className="text-base">Show details</Label>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="show_date">Date *</Label>
              <Input id="show_date" type="date" {...register("show_date")} />
              {errors.show_date && (
                <p className="text-destructive text-xs">{errors.show_date.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="venue_name">Venue *</Label>
              <Input id="venue_name" placeholder="e.g. Madison Square Garden" {...register("venue_name")} />
              {errors.venue_name && (
                <p className="text-destructive text-xs">{errors.venue_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="venue_city">City *</Label>
                <Input id="venue_city" placeholder="e.g. New York" {...register("venue_city")} />
                {errors.venue_city && (
                  <p className="text-destructive text-xs">{errors.venue_city.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="venue_state">State / Region</Label>
                <Input id="venue_state" placeholder="e.g. NY" {...register("venue_state")} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="venue_country">Country</Label>
              <Input id="venue_country" placeholder="e.g. United States" {...register("venue_country")} />
            </div>
          </div>
        </>
      )}

      {/* Songs */}
      {songs.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label>Highlight your favorite songs</Label>
            <SongHighlighter
              songs={songs}
              highlighted={highlighted}
              onToggle={toggleHighlight}
            />
          </div>
        </>
      )}

      <Separator />

      {/* Ratings */}
      <div className="flex flex-col gap-4">
        <Label>Ratings</Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Overall</span>
            <StarRating value={overallRating} onChange={setOverallRating} label="Overall" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Sound</span>
            <StarRating value={soundRating} onChange={setSoundRating} label="Sound" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Setlist</span>
            <StarRating value={setlistRating} onChange={setSetlistRating} label="Setlist" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Venue</span>
            <StarRating value={venueRating} onChange={setVenueRating} label="Venue" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Crowd</span>
            <StarRating value={crowdRating} onChange={setCrowdRating} label="Crowd" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Other acts */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="other_acts">Other acts</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="other_acts"
              placeholder="e.g. Pixies, Oasis"
              {...register("other_acts")}
            />
            {loadingOtherActs && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {selectedSetlist && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={loadingOtherActs}
              onClick={() => fetchOtherActs(selectedSetlist.venue.id, selectedSetlist.eventDate, selectedSetlist.artist.name)}
              title="Re-fetch other acts from Setlist.fm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Auto-filled from Setlist.fm when available. Edit as needed.
        </p>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="How was the night? Any memories worth keeping?"
          rows={4}
          {...register("notes")}
        />
      </div>

      {/* Photos */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="photos">Photo</Label>
        <Input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
        />
        {photos.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {photos.length} photo{photos.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      <FormActions>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Log show"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
      </FormActions>
    </form>
  )
}
