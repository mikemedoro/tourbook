"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/layout/page-header"
import { createClient } from "@/lib/supabase/client"

const schema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or fewer")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores")
    .transform((v) => v.toLowerCase()),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          username: values.username,
          full_name: `${values.first_name} ${values.last_name}`.trim(),
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Check your email to confirm your account.")
    router.push("/login")
  }

  async function signUpWithGoogle() {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        align="center"
        title="Create your account"
        description="Start logging your shows"
      />

      <Button
        variant="outline"
        className="w-full"
        onClick={signUpWithGoogle}
        disabled={googleLoading}
      >
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="first_name">First name</Label>
            <Input
              id="first_name"
              placeholder="Jane"
              autoComplete="given-name"
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="text-destructive text-xs">{errors.first_name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="last_name">Last name</Label>
            <Input
              id="last_name"
              placeholder="Smith"
              autoComplete="family-name"
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="text-destructive text-xs">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="yourname"
            autoComplete="username"
            className="lowercase"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-destructive text-xs">{errors.username.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-destructive text-xs">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4 text-foreground">
          Sign in
        </Link>
      </p>
    </div>
  )
}
