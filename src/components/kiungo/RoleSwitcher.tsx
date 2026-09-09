"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { switchPersona } from "@/actions/session";
import { DEMO_PERSONAS, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function RoleSwitcher({
  currentUserId,
  currentName,
  currentRole,
  currentEntity,
  compact = false,
  tone = "dark",
}: {
  currentUserId: string;
  currentName: string;
  currentRole: Role;
  currentEntity: string | null;
  compact?: boolean;
  tone?: "dark" | "light";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSelect(userId: string) {
    startTransition(async () => {
      const result = await switchPersona({ userId });
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={tone === "dark" ? "darkGhost" : "outline"}
          size={compact ? "icon" : "default"}
          className={cn(
            "w-full justify-between",
            compact && "w-11 px-0",
            pending && "opacity-70",
          )}
          aria-label="Switch demo persona"
        >
          {compact ? (
            <span className="font-display text-xs font-semibold">
              {currentName.slice(0, 1)}
            </span>
          ) : (
            <>
              <span className="flex min-w-0 flex-col items-start text-left">
                <span className="truncate text-xs font-medium">{currentName}</span>
                <span
                  className={cn(
                    "truncate text-[11px]",
                    tone === "dark" ? "text-forest-100/70" : "text-ink-400",
                  )}
                >
                  {ROLE_LABELS[currentRole]}
                  {currentEntity ? ` · ${currentEntity}` : ""}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Demo personas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DEMO_PERSONAS.map((persona) => (
          <DropdownMenuItem
            key={persona.id}
            onSelect={() => onSelect(persona.id)}
            className={cn(
              "flex-col items-start py-2",
              persona.id === currentUserId && "bg-lime-100",
            )}
          >
            <span className="text-sm font-medium text-ink-900">{persona.name}</span>
            <span className="text-xs text-ink-400">
              {ROLE_LABELS[persona.role]}
              {persona.entityName ? ` · ${persona.entityName}` : ""}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
