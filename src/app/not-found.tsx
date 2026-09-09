import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-paper px-4 text-center">
      <div className="rounded-full bg-forest-100 p-4">
        <SearchX className="h-6 w-6 text-forest-900" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-ink-900">
        This page is not in the registry
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-600">
        The path does not match a Kiungo route. Search the verified entity
        registry or return to the landing page.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/registry">Search the registry</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to landing</Link>
        </Button>
      </div>
    </div>
  );
}
