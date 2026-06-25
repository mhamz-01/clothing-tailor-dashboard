export function HistoryEmptyState() {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center">
        <p className="text-sm font-medium text-gray-500">No records found</p>
        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
      </div>
    )
  }