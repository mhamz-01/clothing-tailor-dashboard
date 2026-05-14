"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AlertDialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null)

function useAlertDialogContext(component: string) {
  const ctx = React.useContext(AlertDialogContext)
  if (!ctx) {
    throw new Error(`${component} must be used within <AlertDialog>`)
  }
  return ctx
}

function AlertDialog({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next)
      }
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>{children}</AlertDialogContext.Provider>
  )
}

function AlertDialogTrigger({
  asChild,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  children: React.ReactNode
}) {
  const { setOpen } = useAlertDialogContext("AlertDialogTrigger")

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{
        onClick?: (event: React.MouseEvent) => void
        className?: string
      }>,
      {
        className: cn((children as React.ReactElement<{ className?: string }>).props.className, className),
        onClick: (event: React.MouseEvent) => {
          ;(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>).props.onClick?.(
            event
          )
          if (!event.defaultPrevented) {
            setOpen(true)
          }
        },
      }
    )
  }

  return (
    <button type="button" className={className} onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  )
}

function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-overlay"
      className={cn("fixed inset-0 z-0 bg-black/50", className)}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open, setOpen } = useAlertDialogContext("AlertDialogContent")

  React.useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, setOpen])

  if (!open) return null

  return (
    <AlertDialogPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <AlertDialogOverlay
          onClick={() => setOpen(false)}
          aria-hidden
        />
        <div
          data-slot="alert-dialog-content"
          role="alertdialog"
          aria-modal="true"
          className={cn(
            "bg-background border-border relative z-[60] grid w-full max-w-lg gap-4 rounded-xl border p-6 shadow-lg duration-200",
            className
          )}
          onClick={(event) => event.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="alert-dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return <Button variant="destructive" className={cn(className)} {...props} />
}

function AlertDialogCancel({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { setOpen } = useAlertDialogContext("AlertDialogCancel")
  return (
    <Button
      variant="outline"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          setOpen(false)
        }
      }}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
