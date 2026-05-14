"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return null
}

export function SelectTrigger(_props: {
  className?: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return null
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return null
}

export function SelectItem({
  value,
  disabled,
  className,
  children,
}: {
  value: string
  disabled?: boolean
  className?: string
  children: React.ReactNode
}) {
  return null
}

function flattenLabel(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(flattenLabel).join("")
  if (React.isValidElement(node) && node.props && "children" in node.props) {
    return flattenLabel((node.props as { children?: React.ReactNode }).children)
  }
  return ""
}

type ParsedOption = {
  value: string
  label: string
  disabled?: boolean
  className?: string
}

function parseSelectChildren(children: React.ReactNode): {
  triggerClassName?: string
  triggerDisabled?: boolean
  placeholder: string
  options: ParsedOption[]
} {
  let triggerClassName: string | undefined
  let triggerDisabled: boolean | undefined
  let placeholder = "Select..."

  const options: ParsedOption[] = []

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return

    if (child.type === SelectTrigger) {
      const triggerProps = child.props as {
        className?: string
        disabled?: boolean
      }
      triggerClassName = triggerProps.className
      triggerDisabled = triggerProps.disabled
      React.Children.forEach((child.props as { children?: React.ReactNode }).children, (grand) => {
        if (!React.isValidElement(grand)) return
        if (grand.type === SelectValue) {
          const p = (grand.props as { placeholder?: string }).placeholder
          if (p) placeholder = p
        }
      })
    }

    if (child.type === SelectContent) {
      React.Children.forEach((child.props as { children?: React.ReactNode }).children, (item) => {
        if (!React.isValidElement(item)) return
        if (item.type === SelectItem) {
          const props = item.props as {
            value: string
            disabled?: boolean
            className?: string
            children: React.ReactNode
          }
          options.push({
            value: String(props.value),
            label: flattenLabel(props.children),
            disabled: props.disabled,
            className: props.className,
          })
        }
      })
    }
  })

  return { triggerClassName, triggerDisabled, placeholder, options }
}

export function Select({
  value,
  onValueChange,
  children,
}: {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}) {
  const { triggerClassName, triggerDisabled, placeholder, options } =
    parseSelectChildren(children)

  return (
    <div className="relative w-full">
      <select
        className={cn(
          "border-input bg-background ring-offset-background flex h-10 w-full appearance-none rounded-md border px-3 py-2 pr-10 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName
        )}
        value={value}
        disabled={triggerDisabled}
        onChange={(event) => onValueChange(event.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
            className={opt.className}
          >
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-50"
        aria-hidden
      />
    </div>
  )
}
