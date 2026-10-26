// Field styling and formats shared by every tailor-module order form
// (Shalwar Kameez, Waistcoat, Pant, Coat, Shirt).

// Shared field styling — based on the Claude Design spec
// (Shalwar Kameez Dashboard.dc.html): #c7c7cf borders, 3px radius, black
// focus ring. Text bumped up from the spec's 12px/normal to 13px/medium
// (client request) for readability, since older users read this form.
export const FIELD_CLASS =
  "rounded-[3px] border-[#c7c7cf] bg-white px-[6px] py-0 text-[13px] font-medium text-[#111116] placeholder:text-[#b5b5bd] focus-visible:border-black focus-visible:ring-[3px] focus-visible:ring-black/[0.14]"

// Hides the browser's up/down spin-button counter on type="number" inputs
// (measurements, Tailoring/Cloth/Shiling/Others Amt) -- these are entered by
// tapping digits, not by clicking through a counter, and the arrows were
// eating into the field's already-tight width.
export const NO_SPINNER_CLASS =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

// Client No is a fixed alphabet-number format (e.g. "A-1", "B-23") — the
// tailor picks the letter and number, but the shape itself is not editable.
export const CLIENT_NO_PATTERN = /^[A-Za-z]-\d+$/
