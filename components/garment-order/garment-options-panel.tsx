import { CheckboxGroup } from "@/components/tailor-shared/checkbox-group"
import { RadioOptionGroup } from "@/components/tailor-shared/radio-option-group"
import { SizeQuickPick } from "@/components/tailor-shared/size-quick-pick"
import { handleGridArrowKeyDown } from "@/lib/utils/keyboard-nav"
import type { GarmentDefinition } from "@/types/garment-form"

interface GarmentOptionsPanelProps {
  definition: GarmentDefinition
  options: Record<string, string>
  flags: string[]
  onOptionChange: (column: string, value: string) => void
  onToggleFlag: (code: string) => void
}

// Middle column: the garment's style choices, one bordered row per section, in
// the order the definition lists them. Radio sections write a single value to
// their column; flag sections toggle codes in the shared flags array. The panel
// is one arrow-key grid (a section = a row), so Up/Down flows through all of them.
export function GarmentOptionsPanel({ definition, options, flags, onOptionChange, onToggleFlag }: GarmentOptionsPanelProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-2" data-nav-container onKeyDown={handleGridArrowKeyDown}>
      {definition.sections.map((section, row) => {
        if (section.kind === "flags") {
          const items = section.flags.map((flag) => ({
            key: flag.value,
            label: flag.label,
            checked: flags.includes(flag.value),
            onChange: () => onToggleFlag(flag.value),
          }))
          return (
            <div key={`${section.column}-${row}`} className="rounded-[5px] border border-[#dcdce1] bg-[#fafafb] px-3 py-[15px]">
              <CheckboxGroup items={items} navRowOffset={row} />
            </div>
          )
        }

        const items = section.choices.map((choice) => ({
          value: choice.value,
          label: choice.label,
          checked: options[section.column] === choice.value,
          onChange: () => onOptionChange(section.column, choice.value),
        }))
        const designNo = section.designNo

        return (
          <RadioOptionGroup
            key={section.column}
            title={section.title}
            titleUr={section.titleUr}
            name={section.column}
            options={items}
            navRow={row}
            trailingSlot={
              designNo && (
                <SizeQuickPick
                  label={designNo.label}
                  value={options[designNo.column] ?? ""}
                  onChange={(value) => onOptionChange(designNo.column, value)}
                  options={designNo.choices}
                  navRow={row}
                  navCol={items.length}
                />
              )
            }
          />
        )
      })}
    </div>
  )
}
