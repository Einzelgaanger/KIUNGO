"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { InstantLink } from "@/components/kiungo/InstantLink";
import { BrandMark, NavBrandMark } from "@/components/kiungo/BrandMark";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/whatsapp", label: "WhatsApp demo" },
  { href: "/registry", label: "Live registry" },
];

export function SiteNav({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const [progress, setProgress] = useState(overlay ? 0 : 1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!overlay) {
      setProgress(1);
      return;
    }
    function onScroll() {
      const next = Math.min(1, Math.max(0, window.scrollY / 180));
      setProgress(next);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const scrolled = progress > 0.72;

  return (
    <header
      className={cn("nav", overlay && "on-hero", scrolled && "scrolled")}
      style={
        {
          "--nav-progress": overlay ? progress : 1,
          boxShadow:
            overlay && progress > 0.08
              ? `0 8px 28px rgba(14,31,26, ${0.07 * progress})`
              : undefined,
          backdropFilter: overlay && progress > 0.05 ? `blur(${12 * progress}px)` : undefined,
        } as CSSProperties
      }
    >
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label={BRAND.name}>
          <span className="brand-tile">
            <NavBrandMark />
          </span>
          <span className="brand-word">{BRAND.name}</span>
        </Link>
        <nav className="nav-links" aria-label="Marketing">
          {LINKS.map((link) => (
            <InstantLink
              key={link.href}
              href={link.href}
              className={cn("nav-link", pathname === link.href && "is-active")}
            >
              {link.label}
            </InstantLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <InstantLink href="/registry" className="btn btn-dark hidden sm:inline-flex">
            Enter registry
            <span className="node">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </InstantLink>
          <button
            type="button"
            className="nav-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="nav-sheet">
          <div className="mb-8 flex items-center justify-between">
            <BrandMark size={40} />
            <button type="button" className="touch-target" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          {LINKS.map((link) => (
            <InstantLink
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </InstantLink>
          ))}
          <InstantLink href="/build" onClick={() => setOpen(false)}>
            I want to build
          </InstantLink>
        </div>
      ) : null}
    </header>
  );
}
