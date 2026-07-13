import { CheckboxGroup } from "@/components/shalwar-kameez/checkbox-group"
import { NumberedQuickPick } from "@/components/shalwar-kameez/numbered-quick-pick"
import { RadioOptionGroup } from "@/components/shalwar-kameez/radio-option-group"
import type { CheckboxItem, RadioItem } from "@/types/shalwar-kameez"

interface StyleOptionsPanelProps {
  styleFlagItems: CheckboxItem[]
  pocketOptions: RadioItem[]
  bainOptions: RadioItem[]
  collarOptions: RadioItem[]
  damanOptions: RadioItem[]
  bainStyleNo: string
  onBainStyleNoChange: (value: string) => void
  collarStyleNo: string
  onCollarStyleNoChange: (value: string) => void
  shalwarZipItem: CheckboxItem
}

// The middle column of the form: independent style flags, then the four
// single-select option groups, each its own bordered row. Bain/Gala and
// Collar/Cut get a numbered quick-pick dropdown at the far right; Daman gets
// the Shalwar Zip checkbox there instead. Mirrors the Claude Design spec
// (Shalwar Kameez Dashboard.dc.html) pixel-for-pixel.
export function StyleOptionsPanel({
  styleFlagItems,
  pocketOptions,
  bainOptions,
  collarOptions,
  damanOptions,
  bainStyleNo,
  onBainStyleNoChange,
  collarStyleNo,
  onCollarStyleNoChange,
  shalwarZipItem,
}: StyleOptionsPanelProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-2">
      <div className="rounded-[5px] border border-[#dcdce1] bg-[#fafafb] px-2.5 py-[9px]">
        <CheckboxGroup items={styleFlagItems} columns={4} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between gap-2">
        <RadioOptionGroup title="Pockets" name="pocket" options={pocketOptions} />

        <RadioOptionGroup
          title="Bain / Gala"
          name="bain"
          options={bainOptions}
          trailingSlot={<NumberedQuickPick value={bainStyleNo} onChange={onBainStyleNoChange} />}
        />

        <RadioOptionGroup
          title="Collar / Cut"
          name="collar"
          options={collarOptions}
          trailingSlot={<NumberedQuickPick value={collarStyleNo} onChange={onCollarStyleNoChange} />}
        />

        <RadioOptionGroup
          title="Daman"
          name="daman"
          options={damanOptions}
          trailingSlot={
            <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-[#222226]">
              <input
                type="checkbox"
                checked={shalwarZipItem.checked}
                onChange={shalwarZipItem.onChange}
                className="size-4 cursor-pointer accent-[#111116]"
              />
              Shalwar Zip
            </label>
          }
        />
      </div>
    </div>
  )
}
