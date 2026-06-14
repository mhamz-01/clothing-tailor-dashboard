import Image from "next/image"


export default function Footer() {
    return (
      <footer className="mt-8 border-t border-slate-200 rounded-lg">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            
            {/* Logo + Brand */}
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white">
                <Image src="/paradise-tailor-logo-lightbackground.png" alt="Paradise Tailor" width={62} height={62} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Paradise Tailor</p>
              
              </div>
            </div>
  
            {/* Center — copyright */}
            <p className="text-xs text-slate-400 text-center">
              © {new Date().getFullYear()} Copy Right Reserved.
            </p>
  
            {/* Contact */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Developed by</span>
              <span className="font-semibold text-slate-700">IntellectualHut</span>
              <span>·</span>
              <a href="tel:03049024972" className="font-medium text-slate-700 hover:text-slate-900 transition">
                0304-9024972
              </a>
            </div>
  
          </div>
        </div>
      </footer>
    )
  }