export default function WhatsAppLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0A1712] px-4">
      <div className="w-full max-w-[280px] animate-fade-in">
        <div className="overflow-hidden rounded-[28px] border-[6px] border-[#0E1F1A] bg-white" style={{ height: 560 }}>
          <div className="flex h-10 items-center gap-2 bg-[#0E1F1A] px-2.5">
            <span className="h-6 w-6 rounded-full bg-[#D3F36B]" />
            <div>
              <p className="text-[11px] font-semibold leading-tight text-white">Kiungo</p>
              <p className="text-[8px] leading-tight text-white/60">Opening WhatsApp demo…</p>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div className="h-16 w-4/5 rounded-lg bg-[#F7FAF6]" />
            <div className="ml-auto h-8 w-12 rounded-lg bg-[#F4FBE3]" />
            <div className="h-20 w-3/4 rounded-lg bg-[#F7FAF6]" />
          </div>
        </div>
      </div>
    </div>
  );
}
