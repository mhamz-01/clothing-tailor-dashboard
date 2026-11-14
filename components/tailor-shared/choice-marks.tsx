// Visual marks for the native (screen-reader-only) radio / checkbox inputs.
// A round mark means "pick one", a square mark with a tick means "pick any":
// the shapes alone tell the tailor how a group behaves. Both read the state of
// the closest `peer` input, so the real input still owns focus and keyboard.

export const CHOICE_LABEL_CLASS =
  "group relative flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1 text-[14px] font-semibold whitespace-nowrap text-[#1B2233] transition-colors hover:bg-[#EEF1F7] has-[:checked]:bg-[#E6EBF5] has-[:checked]:font-bold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-[#1F2A44]"

export function RadioMark() {
  return (
    <span
      aria-hidden
      className="size-[18px] shrink-0 rounded-full border-2 border-[#5A6074] bg-white transition-all group-hover:border-[#1F2A44] peer-checked:border-[#1F2A44] peer-checked:bg-[#1F2A44] peer-checked:shadow-[inset_0_0_0_3px_white]"
    />
  )
}

export function CheckMark() {
  return (
    <span
      aria-hidden
      className="relative size-[18px] shrink-0 rounded-[4px] border-2 border-[#5A6074] bg-white transition-all group-hover:border-[#1F2A44] peer-checked:border-[#1F2A44] peer-checked:bg-[#1F2A44]"
    >
      <svg viewBox="0 0 14 14" className="absolute inset-0 hidden size-full p-[1px] text-white group-has-[:checked]:block" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7.5l2.7 2.7L11 4.5" />
      </svg>
    </span>
  )
}
