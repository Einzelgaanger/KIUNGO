import Link from "next/link";
import { Logo } from "@/components/kiungo/Logo";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/constants";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-forest-950 text-white">
      <header className="sticky top-0 z-30 border-b border-forest-800 bg-forest-950/95">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Logo tone="dark" />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="link" className="text-forest-100 min-h-11">
              <Link href="/how-it-works">How it works</Link>
            </Button>
            <Button asChild variant="darkGhost" size="sm" className="hidden sm:inline-flex">
              <Link href="/whatsapp">WhatsApp demo</Link>
            </Button>
            <Button asChild variant="accent" size="sm">
              <Link href="/registry">Live registry</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-forest-800 bg-forest-950">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <Logo tone="dark" />
          <div className="flex flex-wrap gap-4 text-sm text-forest-100">
            <Link href="/how-it-works" className="hover:text-white">
              How it works
            </Link>
            <Link href="/registry" className="hover:text-white">
              Registry
            </Link>
            <Link href="/whatsapp" className="hover:text-white">
              WhatsApp demo
            </Link>
            <Link href="/build" className="hover:text-white">
              I want to build
            </Link>
          </div>
          <p className="text-xs text-forest-100/70">{COPY.landing.footerNote}</p>
        </div>
      </footer>
    </div>
  );
}
