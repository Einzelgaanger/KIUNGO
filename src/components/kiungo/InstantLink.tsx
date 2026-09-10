"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentProps, type MouseEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

const inFlight = new Set<string>();
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function hrefToPath(href: ComponentProps<typeof Link>["href"]): string {
  return typeof href === "string" ? href : href.pathname ?? "";
}

function isModifiedClick(event: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean }) {
  return Boolean(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}

export function useNavPending() {
  const [pending, setPending] = useState(() => inFlight.size > 0);

  useEffect(() => {
    const sync = () => setPending(inFlight.size > 0);
    listeners.add(sync);
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return pending;
}

export function InstantLink({
  href,
  children,
  className,
  pendingLabel,
  onClick,
  onPointerDown,
  prefetch = true,
  ...props
}: ComponentProps<typeof Link> & { pendingLabel?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const target = hrefToPath(href);
  const [busy, setBusy] = useState(() => inFlight.has(target));

  useEffect(() => {
    const sync = () => setBusy(inFlight.has(target));
    listeners.add(sync);
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, [target]);

  useEffect(() => {
    if (!target) return;
    if (pathname === target || pathname.startsWith(`${target}?`)) {
      inFlight.delete(target);
      notify();
    }
  }, [pathname, target]);

  function go() {
    if (!target || pathname === target || inFlight.has(target)) return;
    inFlight.add(target);
    notify();
    router.push(target);
    window.setTimeout(() => {
      inFlight.delete(target);
      notify();
    }, 12_000);
  }

  function handlePointerDown(event: PointerEvent<HTMLAnchorElement>) {
    onPointerDown?.(event);
    if (event.defaultPrevented || event.button !== 0 || isModifiedClick(event)) return;
    if (pathname === target || inFlight.has(target)) return;
    event.preventDefault();
    go();
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || isModifiedClick(event)) return;
    event.preventDefault();
    go();
  }

  return (
    <Link
      {...props}
      href={href}
      prefetch={prefetch}
      className={cn(busy && "opacity-80", className)}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      aria-busy={busy}
    >
      {busy && pendingLabel ? pendingLabel : children}
    </Link>
  );
}

/** @deprecated Use InstantLink */
export const PendingLink = InstantLink;
