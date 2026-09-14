"use client";

import { Bookmark } from "lucide-react";
import { InstantLink } from "@/components/kiungo/InstantLink";
import { EmptyState } from "@/components/kiungo/EmptyState";
import { PageFade } from "@/components/kiungo/PageFade";
import { SectionHeading } from "@/components/kiungo/SectionHeading";
import { useShortlist } from "@/components/kiungo/ShortlistProvider";

export function ShortlistBoard() {
  const shortlist = useShortlist();

  return (
    <PageFade>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
        <SectionHeading
          eyebrow="Discover"
          title="Shortlist"
          description="Names you marked while reading the registry. They stay on this device for the session."
        />
        {shortlist.items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={Bookmark}
              title="Nothing shortlisted yet."
              description="Open a registry file and add it to the shortlist. Use this when you are comparing suppliers."
            />
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-surface">
            {shortlist.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <InstantLink href={`/registry/${item.slug}`} className="font-medium text-ink-900 underline-offset-2 hover:underline">
                  {item.name}
                </InstantLink>
                <button
                  type="button"
                  className="text-sm text-ink-600 underline"
                  onClick={() => shortlist.toggle(item)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageFade>
  );
}
