import { LucideIcon } from "lucide-react";


export function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: LucideIcon }) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight">{value}</h3>
          </div>
          <div className="rounded-lg border bg-slate-50 p-2">
            <Icon className="h-4 w-4 text-slate-600" />
          </div>
        </div>
      </div>
    )
  }