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
import { Loader2 } from "lucide-react"

const schema = z.object({
  username: z
    .string()
    .min(3, "Must be at least 3 characters")
    .max(30, "Must be 30 characters or fewer")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
})

type FormValues = z.infer<typeof schema>

export function UsernameForm({ defaultUsername }: { defaultUsername: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: defaultUsername },
  })

  async function onSubmit(values: FormValues) {
    setSaving(true)

    // Check uniqueness before attempting update
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", values.username)
      .maybeSingle()

    if (existing) {
      setError("username", { message: "Username is already taken" })
      setSaving(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ username: values.username })
      .eq("id", user.id)

    setSaving(false)

    if (error) {
      if (error.code === "23505") {
        setError("username", { message: "Username is already taken" })
      } else {
        toast.error("Failed to save username.")
      }
      return
    }

    router.push("/feed")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="yourname"
          autoComplete="username"
          autoFocus
          {...register("username")}
        />
        {errors.username && (
          <p className="text-destructive text-xs">{errors.username.message}</p>
        )}
      </div>
      <Button type="submit" disabled={saving} className="self-start">
        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Continue
      </Button>
    </form>
  )
}
