import { ShalwarKameezForm } from "@/components/shalwar-kameez/shalwar-kameez-form"

export default function ShalwarKameezOrderPage() {
  return (
    <div className="min-h-screen w-full px-5 py-4 md:px-7">
      <h1 className="mb-3 text-xl font-bold text-slate-900">
        Shalwar Kameez
        <span className="ml-2 font-[family-name:var(--font-urdu)] text-lg font-normal text-slate-500">شلوار قمیض</span>
      </h1>
      <ShalwarKameezForm />
    </div>
  )
}
