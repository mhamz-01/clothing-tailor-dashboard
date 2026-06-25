import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
  columns?: number
  rows?: number
}

export function TableSkeleton({ columns = 7, rows = 6 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3"><Skeleton className="h-4 w-16 rounded" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-t border-gray-100">
              {Array.from({ length: columns }).map((__, j) => (
                <td key={j} className="px-4 py-4"><Skeleton className="h-4 w-full rounded" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}