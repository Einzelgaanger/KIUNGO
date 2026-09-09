"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { COUNTIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COPY } from "@/lib/constants";

export function CountyFilter({
  value,
  onChange,
}: {
  value: string[];
  onChange: (codes: string[]) => void;
}) {
  const selected = value.length === 0 ? "All counties" : `${value.length} counties`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between md:w-56">
          <span className="truncate">{selected}</span>
          <span className="flex items-center gap-2">
            {value.length > 0 ? (
              <span className="rounded-pill bg-forest-100 px-2 py-0.5 text-[11px] tabular-nums text-forest-900">
                {value.length}
              </span>
            ) : null}
            <ChevronsUpDown className="h-4 w-4 text-ink-400" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Search counties" />
          <CommandList>
            <CommandEmpty>{COPY.empty.searchNone.title.replace('"{query}"', "that county")}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => onChange([])}
                className={cn(value.length === 0 && "bg-lime-100")}
              >
                All counties
              </CommandItem>
              {COUNTIES.map((county) => {
                const active = value.includes(county.code);
                return (
                  <CommandItem
                    key={county.code}
                    onSelect={() => {
                      onChange(
                        active
                          ? value.filter((code) => code !== county.code)
                          : [...value, county.code],
                      );
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", active ? "opacity-100" : "opacity-0")} />
                    {county.name}
                    <span className="ml-auto font-mono text-[11px] text-ink-400">{county.code}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
