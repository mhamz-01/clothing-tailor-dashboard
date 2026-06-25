import { ClipboardList, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Tab = "assign" | "manage"

interface TabsHeaderProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  stagedCount: number
  onClearAll: () => void
}

export function TabsHeader({ activeTab, onTabChange, stagedCount, onClearAll }: TabsHeaderProps) {
  return (
    <div className="flex border-b">
      <button onClick={() => onTabChange("assign")} className={cn("flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2", activeTab === "assign" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700")}>
        <ClipboardList className="size-4" />
        Order List
        {stagedCount > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">{stagedCount}</span>}
      </button>
      <button onClick={() => onTabChange("manage")} className={cn("flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2", activeTab === "manage" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700")}>
        <ListChecks className="size-4" />
        Manage Assigned
      </button>

      {activeTab === "assign" && stagedCount > 0 && (
        <div className="ml-auto flex items-center pr-4">
          <Button type="button" variant="ghost" size="sm" onClick={onClearAll} className="text-slate-500">Clear All</Button>
        </div>
      )}
    </div>
  )
}