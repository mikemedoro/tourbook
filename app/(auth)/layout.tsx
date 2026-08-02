import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" aria-label="Tourbook home" className="mb-8">
        <Wordmark size="lg" />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
