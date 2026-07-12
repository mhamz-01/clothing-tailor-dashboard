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
export function StyleOptionsPanel({
  basicCheckItems,
  styleFlagItems,
  partDesignRows,
  onPartDesignChange,
  onPartDesignLabelClick,
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
    <div className="flex flex-col gap-3.5">
      <CheckboxGroup items={basicCheckItems} />

      <PartDesignTable rows={partDesignRows} onSizeChange={onPartDesignChange} onLabelClick={onPartDesignLabelClick} />

      <div className="border-t border-slate-200 pt-2">
        <CheckboxGroup items={styleFlagItems} />
      </div>

      <div className="flex flex-col gap-3">
        <RadioOptionGroup title="Pocket Type" name="pocket" options={pocketOptions} />
        <RadioOptionGroup
          title="Bain / Gala Type"
          name="bain"
          options={bainOptions}
          trailingSlot={<NumberedQuickPick value={bainStyleNo} onChange={onBainStyleNoChange} />}
        />
        <RadioOptionGroup
          title="Collar Type"
          name="collar"
          options={collarOptions}
          trailingSlot={<NumberedQuickPick value={collarStyleNo} onChange={onCollarStyleNoChange} />}
        />
        <RadioOptionGroup title="Daman Type" name="daman" options={damanOptions} />
      </div>
    </div>
  )
}
