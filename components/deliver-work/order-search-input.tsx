import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function OrderSearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
      <Input
        placeholder="Search by customer or tailor..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl border-gray-200 bg-white pl-10 text-sm"
      />
    </div>
  )
}