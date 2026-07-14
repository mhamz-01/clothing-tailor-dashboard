"use client"

import { useRef, type KeyboardEvent, type MouseEvent } from "react"
import { cn } from "@/lib/utils"

function splitClientNo(value: string): [string, string] {
  const dashIndex = value.indexOf("-")
  if (dashIndex === -1) return [value, ""]
  return [value.slice(0, dashIndex), value.slice(dashIndex + 1)]
}

function focusAtEnd(el: HTMLInputElement | null) {
  if (!el) return
  el.focus()
  const end = el.value.length
  el.setSelectionRange(end, end)
}

interface ClientNoInputProps {
  value: string
  onChange: (value: string) => void
  invalid: boolean
  className?: string
  inputClassName?: string
}

// Fixed A-1 shape shared by every Client No field in the app (client-lookup-
// section's main strip, add-client-modal's Client ID): a single-letter box, a
// static hyphen, and a digits-only box -- each side only ever accepts its own
// character class, so the format can't be typed wrong. Typing the letter
// auto-advances focus into the number box; arrow keys jump between boxes at
// their edges like a standard OTP/segmented input.
export function ClientNoInput({ value, onChange, invalid, className, inputClassName }: ClientNoInputProps) {
  const [letterPart, numberPart] = splitClientNo(value)
  const letterRef = useRef<HTMLInputElement>(null)
  const numberRef = useRef<HTMLInputElement>(null)

  function handleLetterChange(raw: string) {
    const letter = raw.replace(/[^a-zA-Z]/g, "").slice(0, 1).toUpperCase()
    onChange(`${letter}-${numberPart}`)
    if (letter) focusAtEnd(numberRef.current)
  }

  function handleNumberChange(raw: string) {
    onChange(`${letterPart}-${raw.replace(/[^0-9]/g, "")}`)
  }

  function handleLetterKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const el = e.currentTarget
    if (e.key === "ArrowRight" && el.selectionStart === el.value.length) {
      e.preventDefault()
      focusAtEnd(numberRef.current)
    }
  }

  function handleNumberKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const el = e.currentTarget
    if (e.key === "ArrowLeft" && el.selectionStart === 0) {
      e.preventDefault()
      focusAtEnd(letterRef.current)
    }
  }

  // Letter comes first by default: clicking straight into the number box (or
  // anywhere in the container padding/hyphen) before a letter's been entered
  // sends focus to the letter box instead, since that's the field meant to be
  // filled first. Once a letter exists, clicking the number box works normally.
  //
  // Checked against the letter input's live DOM value, not the `letterPart`
  // prop-derived value above: handleLetterChange's auto-advance focuses this
  // box in the same synchronous tick as typing the letter, before React has
  // re-rendered with the new value -- reading `letterPart` here would still
  // see the stale empty string and immediately bounce focus back, canceling
  // the auto-advance.
  function handleNumberFocus() {
    if (!letterRef.current?.value) focusAtEnd(letterRef.current)
  }

  function handleContainerClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) focusAtEnd(letterRef.current)
  }

  return (
    <div
      onClick={handleContainerClick}
      className={cn(
        "flex h-6 w-full items-center gap-1 rounded-[3px] border bg-white px-[6px] focus-within:border-black focus-within:ring-[3px] focus-within:ring-black/[0.14]",
        invalid ? "border-[#c0392b]" : "border-[#c7c7cf]",
        className
      )}
    >
      <input
        ref={letterRef}
        value={letterPart}
        onChange={(e) => handleLetterChange(e.target.value)}
        onKeyDown={handleLetterKeyDown}
        placeholder="A"
        aria-label="Client No. letter"
        maxLength={1}
        className={cn(
          "w-6 shrink-0 border-none bg-transparent p-0 text-center text-[13px] font-medium text-[#111116] uppercase outline-none placeholder:text-[#b5b5bd]",
          inputClassName
        )}
      />
      <span className={cn("shrink-0 text-[13px] font-bold text-[#8a8a92]", inputClassName)}>-</span>
      <input
        ref={numberRef}
        value={numberPart}
        onChange={(e) => handleNumberChange(e.target.value)}
        onKeyDown={handleNumberKeyDown}
        onFocus={handleNumberFocus}
        placeholder="1"
        inputMode="numeric"
        aria-label="Client No. number"
        className={cn(
          "min-w-0 flex-1 border-none bg-transparent p-0 text-[13px] font-medium text-[#111116] outline-none placeholder:text-[#b5b5bd]",
          inputClassName
        )}
      />
    </div>
  )
}
