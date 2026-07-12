import { ButtonTypePanel } from "@/components/shalwar-kameez/button-type-panel"
import { CheckboxGroup } from "@/components/shalwar-kameez/checkbox-group"
import { NumberedQuickPick } from "@/components/shalwar-kameez/numbered-quick-pick"
import { PartDesignTable } from "@/components/shalwar-kameez/part-design-table"
import { RadioOptionGroup } from "@/components/shalwar-kameez/radio-option-group"
import type { CheckboxItem, PartDesignRowState, RadioItem } from "@/types/shalwar-kameez"

interface StyleOptionsPanelProps {
  basicCheckItems: CheckboxItem[]
  styleFlagItems: CheckboxItem[]
  partDesignRows: PartDesignRowState[]
  onPartDesignChange: (index: number, field: "size1" | "size2" | "designNo", value: string) => void
  onPartDesignLabelClick: (row: PartDesignRowState) => void
  buttonOptions: RadioItem[]
  pocketOptions: RadioItem[]
  bainOptions: RadioItem[]
  collarOptions: RadioItem[]
  damanOptions: RadioItem[]
  bainStyleNo: string
  onBainStyleNoChange: (value: string) => void
  collarStyleNo: string
  onCollarStyleNoChange: (value: string) => void
}

// The middle column of the form: plain checkboxes, per-part design entry,
// independent style flags, and the four single-select option groups. Bain/Gala
// and Collar Type each get a numbered quick-pick dropdown to the right of their
// radio options, in addition to (not instead of) the radios.
//
// Pocket and Daman (few options, no dropdown) are paired into one row; Collar
// and Bain/Gala (more options + a dropdown) each get a full-width row of their
// own — halving their width caused their options to overflow on smaller screens.
//
// Layout: column 1 stacks the part-design table above the style-flag
// checkboxes; column 2 is Button Type, running alongside both of those rows.
export function StyleOptionsPanel({
  basicCheckItems,
  styleFlagItems,
  partDesignRows,
  onPartDesignChange,
  onPartDesignLabelClick,
  buttonOptions,
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
    <div className="flex min-w-0 flex-col gap-2">
      <CheckboxGroup items={basicCheckItems} />

      <div className="flex gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <PartDesignTable rows={partDesignRows} onSizeChange={onPartDesignChange} onLabelClick={onPartDesignLabelClick} />
          <CheckboxGroup items={styleFlagItems} />
        </div>
        <div className="w-[168px] shrink-0">
          <ButtonTypePanel options={buttonOptions} />
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-1.5">
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
