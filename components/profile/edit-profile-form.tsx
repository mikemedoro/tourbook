"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Profile } from "@/types/database"

const schema = z.object({
  display_name: z.string().max(50, "Max 50 characters").optional(),
  bio: z.string().max(160, "Max 160 characters").optional(),
})

type FormValues = z.infer<typeof schema>

interface EditProfileFormProps {
  profile: Profile
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: profile.display_name ?? "",
      bio: profile.bio ?? "",
    },
  })

  const bioValue = watch("bio") ?? ""

  async function onSubmit(values: FormValues) {
    setSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        display_name: values.display_name || null,
        bio: values.bio || null,
      })
      .eq("id", profile.id)

    setSaving(false)

    if (error) {
      toast.error("Failed to save profile.")
      return
    }

    toast.success("Profile updated.")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-w-md">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="display_name">Name</Label>
        <Input id="display_name" placeholder="Your name" {...register("display_name")} />
        {errors.display_name && (
          <p className="text-destructive text-xs">{errors.display_name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio">Bio</Label>
          <span className="text-xs text-muted-foreground">{bioValue.length}/160</span>
        </div>
        <Textarea
          id="bio"
          placeholder="Tell people a little about yourself…"
          rows={3}
          className="resize-none"
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-destructive text-xs">{errors.bio.message}</p>
        )}
      </div>

      <Button type="submit" disabled={saving} className="self-start">
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  )
}
