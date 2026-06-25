import { Loader2, PackageCheck } from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDeliveryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderCount: number
  isDelivering: boolean
  onConfirm: () => void
}

export function ConfirmDeliveryDialog({ open, onOpenChange, orderCount, isDelivering, onConfirm }: ConfirmDeliveryDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-emerald-50">
            <PackageCheck className="size-5 text-emerald-600" />
          </div>
          <AlertDialogTitle className="text-lg font-semibold text-gray-900">Confirm delivery</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-500">
            You are about to mark{" "}
            <span className="font-semibold text-gray-800">{orderCount} order{orderCount > 1 ? "s" : ""}</span>{" "}
            as delivered.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isDelivering} onClick={onConfirm} className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
            {isDelivering ? <><Loader2 className="mr-2 size-4 animate-spin" />Delivering...</> : "Confirm Delivery"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}