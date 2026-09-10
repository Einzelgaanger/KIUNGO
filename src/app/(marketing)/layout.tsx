import { BrandMark } from "@/components/kiungo/BrandMark";
import { PendingLink } from "@/components/kiungo/PendingLink";
import { PrefetchRoutes } from "@/components/kiungo/PrefetchRoutes";
import { BRAND } from "@/lib/brand";
import { COPY } from "@/lib/constants";
import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="kiungo-site min-h-dvh">
      <PrefetchRoutes hrefs={["/whatsapp", "/registry", "/how-it-works"]} />
      {children}
      <footer className="site-footer">
        <div className="container site-footer__grid">
          <div>
            <div className="mb-4 inline-flex items-center gap-3">
              <BrandMark size={40} />
              <span className="font-display text-[22px] font-bold tracking-[-0.03em] text-white">
                {BRAND.name}
              </span>
            </div>
            <p className="max-w-xs text-sm text-white/70">{BRAND.promise}</p>
          </div>
          <div>
            <h4>Product</h4>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/registry">Registry</Link>
            <PendingLink href="/whatsapp" pendingLabel="Opening…">
              WhatsApp demo
            </PendingLink>
          </div>
          <div>
            <h4>Portals</h4>
            <Link href="/console">Console</Link>
            <Link href="/review">Review</Link>
            <Link href="/finance">Finance</Link>
            <Link href="/intelligence">Intelligence</Link>
          </div>
          <div>
            <h4>Citizen</h4>
            <Link href="/build">I want to build</Link>
            <Link href="/api/public/entities">Public API</Link>
          </div>
        </div>
        <div className="container mt-10 flex flex-col gap-3 border-t border-white/12 pt-6 text-xs text-white/55 sm:flex-row sm:justify-between">
          <p>{COPY.landing.footerNote}</p>
          <p>Housing is vertical one. The layer underneath is sector-agnostic.</p>
        </div>
      </footer>
    </div>
  );
}
