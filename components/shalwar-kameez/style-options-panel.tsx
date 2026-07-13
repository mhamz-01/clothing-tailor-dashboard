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
}

// The middle column of the form: independent style flags, and the four
// single-select option groups. Bain/Gala and Collar Type each get a numbered
// quick-pick dropdown to the right of their radio options, in addition to
// (not instead of) the radios.
//
// Pocket and Daman (few options, no dropdown) are paired into one row; Collar
// and Bain/Gala (more options + a dropdown) each get a full-width row of their
// own — halving their width caused their options to overflow on smaller screens.
//
// Button Type, the part-design table (Bazu/Kuf/Button Patti/Jaib), and the
// basic checks (Nokdar Tera/Chalk Asten/Kuf Dbl Kaj/Large Buttons/Shalwar
// Zip) all live in the client-lookup section now (client request), not here.
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
}: StyleOptionsPanelProps) {
  return (
    <div className="-mt-12 flex min-w-0 flex-col gap-1.5">
      <CheckboxGroup items={styleFlagItems} />

      <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-1">
        <RadioOptionGroup title="Pocket Type" name="pocket" options={pocketOptions} />
        <RadioOptionGroup title="Daman Type" name="daman" options={damanOptions} />
        <div className="col-span-2">
          <RadioOptionGroup
            title="Collar Type"
            name="collar"
            options={collarOptions}
            trailingSlot={<NumberedQuickPick value={collarStyleNo} onChange={onCollarStyleNoChange} />}
          />
        </div>
        <div className="col-span-2">
          <RadioOptionGroup
            title="Bain / Gala Type"
            name="bain"
            options={bainOptions}
            trailingSlot={<NumberedQuickPick value={bainStyleNo} onChange={onBainStyleNoChange} />}
          />
        </div>
      </div>
    </div>
  )
}
