"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  BAIN_GALA_OPTIONS,
  BASIC_CHECKS,
  BUTTON_TYPE_OPTIONS,
  COLLAR_OPTIONS,
  DAMAN_OPTIONS,
  MEASUREMENTS,
  PART_DESIGNS,
  POCKET_OPTIONS,
  STYLE_FLAGS,
} from "@/lib/constants/shalwar-kameez"
import { todayDateInputValue } from "@/lib/utils/date"
import type {
  BasicCheckKey,
  OrderAmounts,
  RadioGroupName,
  RadioOptionDefinition,
  ShalwarKameezFormState,
  StyleFlagKey,
} from "@/types/shalwar-kameez"

function createInitialState(): ShalwarKameezFormState {
  return {
    clientNo: "",
    bookDate: todayDateInputValue(),
    recordNo: "",
    clientName: "",
    phoneNo: "",
    pBal: "0",
    measurements: { lambai: "", chaati: "", bazu: "", teera: "", collarM: "", kamar: "", daman: "", shalwarLambai: "", pancha: "" },
    extraNo1: "",
    extraNo2: "",
    note: "",
    basicChecks: { isNokderTera: false, isChalkAsten: false, isKufDblKaj: false, isLargeButtons: false, shalwarZip: false },
    styleFlags: { kafDboty: false, btnDboty: false, noLbl: false, kajPatti: false, fiveBtn: false, twoJeb: false, noJeb: false },
    partDesigns: PART_DESIGNS.map((definition) => ({ ...definition, size1: "", size2: "", designNo: "" })),
    radios: { pocket: "", bain: "", collar: "", daman: "", button: "" },
    bainStyleNo: "",
    collarStyleNo: "",
    order: { quantity: "", deliveryDate: "", tailoringAmount: "", clothAmount: "", shillingAmt: "", othersAmt: "", advance: "" },
    statusMsg: "",
  }
}

function toAmount(value: string): number {
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function useShalwarKameezForm() {
  const router = useRouter()
  const [state, setState] = useState<ShalwarKameezFormState>(createInitialState)

  function flashStatus(message: string) {
    setState((prev) => ({ ...prev, statusMsg: message }))
  }

  function updateField<K extends keyof ShalwarKameezFormState>(key: K, value: ShalwarKameezFormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  function updateMeasurement(key: keyof ShalwarKameezFormState["measurements"], value: string) {
    setState((prev) => ({ ...prev, measurements: { ...prev.measurements, [key]: value } }))
  }

  function toggleBasicCheck(key: BasicCheckKey) {
    setState((prev) => ({ ...prev, basicChecks: { ...prev.basicChecks, [key]: !prev.basicChecks[key] } }))
  }

  function toggleStyleFlag(key: StyleFlagKey) {
    setState((prev) => ({ ...prev, styleFlags: { ...prev.styleFlags, [key]: !prev.styleFlags[key] } }))
  }

  function setRadio(group: RadioGroupName, value: string) {
    setState((prev) => ({ ...prev, radios: { ...prev.radios, [group]: value } }))
  }

  function updatePartDesign(index: number, field: "size1" | "size2" | "designNo", value: string) {
    setState((prev) => {
      const partDesigns = prev.partDesigns.slice()
      partDesigns[index] = { ...partDesigns[index], [field]: value }
      return { ...prev, partDesigns }
    })
  }

  function updateOrderField(key: keyof OrderAmounts, value: string) {
    setState((prev) => ({ ...prev, order: { ...prev.order, [key]: value } }))
  }

  function clearForm() {
    setState({ ...createInitialState(), statusMsg: "Cleared" })
  }

  // The database isn't wired up yet (schema lives in tailor-schema-supabase.md as a
  // migration only), so these actions just surface a status message for now.
  function handleSave() {
    flashStatus("Saving isn't connected yet.")
  }
  function handlePrev() {
    flashStatus("Prev isn't connected yet.")
  }
  function handleNext() {
    flashStatus("Next isn't connected yet.")
  }
  function handlePrintReceipt() {
    flashStatus("Print receipt isn't connected yet.")
  }
  function handleDelete() {
    flashStatus("Delete isn't connected yet.")
  }
  function handlePrint() {
    window.print()
  }
  function handleExit() {
    router.push("/tailor/categories")
  }

  function mapRadioOptions(options: RadioOptionDefinition[], group: RadioGroupName) {
    return options.map((option) => ({
      value: option.value,
      label: option.label,
      checked: state.radios[group] === option.value,
      onChange: () => setRadio(group, option.value),
    }))
  }

  const tailoringAmount = toAmount(state.order.tailoringAmount)
  const clothAmount = toAmount(state.order.clothAmount)
  const shillingAmt = toAmount(state.order.shillingAmt)
  const othersAmt = toAmount(state.order.othersAmt)
  const advance = toAmount(state.order.advance)
  const total = tailoringAmount + clothAmount + shillingAmt + othersAmt
  const balance = total - advance

  const measurementRows = MEASUREMENTS.map((measurement) => ({
    key: measurement.key,
    ur: measurement.ur,
    value: state.measurements[measurement.key],
    onChange: (value: string) => updateMeasurement(measurement.key, value),
  }))

  const basicCheckItems = BASIC_CHECKS.map((check) => ({
    key: check.key,
    label: check.label,
    checked: state.basicChecks[check.key],
    onChange: () => toggleBasicCheck(check.key),
  }))

  const styleFlagItems = STYLE_FLAGS.map((flag) => ({
    key: flag.key,
    label: flag.label,
    checked: state.styleFlags[flag.key],
    onChange: () => toggleStyleFlag(flag.key),
  }))

  return {
    state,
    updateField,
    updateOrderField,
    updatePartDesign,
    clearForm,
    handleSave,
    handlePrev,
    handleNext,
    handlePrint,
    handlePrintReceipt,
    handleDelete,
    handleExit,
    measurementRows,
    basicCheckItems,
    styleFlagItems,
    pocketOptions: mapRadioOptions(POCKET_OPTIONS, "pocket"),
    bainOptions: mapRadioOptions(BAIN_GALA_OPTIONS, "bain"),
    collarOptions: mapRadioOptions(COLLAR_OPTIONS, "collar"),
    damanOptions: mapRadioOptions(DAMAN_OPTIONS, "daman"),
    buttonOptions: mapRadioOptions(BUTTON_TYPE_OPTIONS, "button"),
    total,
    balance,
  }
}
