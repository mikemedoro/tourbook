import Link from "next/link"
import { Music } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-semibold text-lg mb-8">
        <Music className="h-5 w-5" />
        Tourbook
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
