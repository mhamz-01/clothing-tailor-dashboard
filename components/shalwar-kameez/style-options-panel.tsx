import { CheckboxGroup } from "@/components/shalwar-kameez/checkbox-group"
import { RadioOptionGroup } from "@/components/shalwar-kameez/radio-option-group"
import { SizeQuickPick } from "@/components/shalwar-kameez/size-quick-pick"
import { BAIN_SIZE_OPTIONS, COLLAR_SIZE_OPTIONS } from "@/lib/constants/shalwar-kameez"
import { handleGridArrowKeyDown } from "@/lib/utils/keyboard-nav"
import type { CheckboxItem, RadioItem } from "@/types/shalwar-kameez"

interface StyleOptionsPanelProps {
  styleFlagItems: CheckboxItem[]
  largeButtonsItem: CheckboxItem
  pocketOptions: RadioItem[]
  bainOptions: RadioItem[]
  collarOptions: RadioItem[]
  damanOptions: RadioItem[]
  bainSize: string
  onBainSizeChange: (value: string) => void
  collarSize: string
  onCollarSizeChange: (value: string) => void
  shalwarZipItem: CheckboxItem
}

const CHECKBOX_COLUMNS = 4

// The middle column of the form: independent style flags, then the four
// single-select option groups, each its own bordered row. Bain/Gala and
// Collar get a size quick-pick dropdown at the far right; Daman gets the
// Shalwar Zip checkbox there instead. Mirrors the Claude Design spec
// (Shalwar Kameez Dashboard.dc.html) pixel-for-pixel.
//
// The whole panel is one shared arrow-key nav grid (see
// lib/utils/keyboard-nav) -- the checkbox block occupies the first rows, then
// Pockets/Bain-Gala/Collar/Daman follow one after another, so Up/Down flows
// continuously from the last checkbox row down through every option row
// (and back), not just within each row on its own. Shalwar Zip and the Size
// quick-picks each sit one column past their row's last radio option,
// reachable the same way.
export function StyleOptionsPanel({
  styleFlagItems,
  largeButtonsItem,
  pocketOptions,
  bainOptions,
  collarOptions,
  damanOptions,
  bainSize,
  onBainSizeChange,
  collarSize,
  onCollarSizeChange,
  shalwarZipItem,
}: StyleOptionsPanelProps) {
  const checkboxItemCount = styleFlagItems.length + 1 // + largeButtonsItem
  const checkboxRowCount = Math.ceil(checkboxItemCount / CHECKBOX_COLUMNS)
  const pocketRow = checkboxRowCount
  const bainRow = pocketRow + 1
  const collarRow = bainRow + 1
  const damanRow = collarRow + 1

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-2" data-nav-container onKeyDown={handleGridArrowKeyDown}>
      <div className="rounded-[5px] border border-[#dcdce1] bg-[#fafafb] px-2.5 py-[9px]">
        <CheckboxGroup items={[...styleFlagItems, largeButtonsItem]} columns={CHECKBOX_COLUMNS} />
      </div>

      <div className="flex min-h-0 flex-col gap-2">
        <RadioOptionGroup title="Pockets" name="pocket" options={pocketOptions} navRow={pocketRow} />

        <RadioOptionGroup
          title="Bain / Gala"
          name="bain"
          options={bainOptions}
          navRow={bainRow}
          trailingSlot={
            <SizeQuickPick
              value={bainSize}
              onChange={onBainSizeChange}
              options={BAIN_SIZE_OPTIONS}
              navRow={bainRow}
              navCol={bainOptions.length}
            />
          }
        />

        <RadioOptionGroup
          title="Collar / Cut"
          name="collar"
          options={collarOptions}
          navRow={collarRow}
          trailingSlot={
            <SizeQuickPick
              value={collarSize}
              onChange={onCollarSizeChange}
              options={COLLAR_SIZE_OPTIONS}
              navRow={collarRow}
              navCol={collarOptions.length}
            />
          }
        />

        <RadioOptionGroup
          title="Daman"
          name="daman"
          options={damanOptions}
          navRow={damanRow}
          trailingSlot={
            <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[3px] px-1 py-0.5 text-[13px] font-semibold text-[#222226] [&:has(:focus-visible)]:bg-[#eef0ff]">
              <input
                type="checkbox"
                checked={shalwarZipItem.checked}
                onChange={shalwarZipItem.onChange}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return
                  e.preventDefault()
                  shalwarZipItem.onChange()
                }}
                data-nav-row={damanRow}
                data-nav-col={damanOptions.length}
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
