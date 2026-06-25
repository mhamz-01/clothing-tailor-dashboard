import Link from "next/link";

export function ActionButton({ href, label }: { href: string; label: string }) {
    return (
      <Link href={href} className="inline-flex h-10 items-center justify-center rounded-lg border bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
        {label}
      </Link>
    )
  }
  