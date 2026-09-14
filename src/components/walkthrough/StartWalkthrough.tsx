"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type MouseEvent, type ReactNode } from "react";
import { switchPersona } from "@/actions/session";
import { getWalkthrough, withWalkQuery } from "@/lib/walkthroughs";
import { toast } from "sonner";

export function StartWalkthrough({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const walkthrough = getWalkthrough(slug);
  const first = walkthrough?.steps[0];

  if (!walkthrough || !first) return null;
  const personaId = first.personaId;
  const startHref = withWalkQuery(first.href, walkthrough.slug, 0);

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    start(async () => {
      const result = await switchPersona({ userId: personaId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.push(startHref);
    });
  }

  return (
    <Link
      href={`/walkthrough/go/${slug}`}
      className={className}
      aria-disabled={pending}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
