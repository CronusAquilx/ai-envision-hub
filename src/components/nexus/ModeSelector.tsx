import { ChevronDown, Sparkles } from "lucide-react";

import { DEV_MODES, MODE_GROUPS, getMode } from "@/lib/nexus/modes";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { CustomMode } from "@/lib/nexus/queries";

export function ModeSelector({
  value,
  onChange,
  customModes = [],
}: {
  value: string;
  onChange: (v: string) => void;
  customModes?: CustomMode[];
}) {
  const custom = customModes.find((m) => m.id === value);
  const label = custom ? custom.name : getMode(value).name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs">
          <Sparkles className="size-3.5 text-accent" />
          {label}
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-[70vh] w-72 overflow-y-auto scrollbar-thin">
        {MODE_GROUPS.map((group) => {
          const modes = DEV_MODES.filter((m) => m.group === group);
          if (!modes.length) return null;
          return (
            <div key={group}>
              <DropdownMenuLabel className="mono-xs uppercase tracking-widest text-muted-foreground">{group}</DropdownMenuLabel>
              {modes.map((m) => (
                <DropdownMenuItem key={m.id} onSelect={() => onChange(m.id)} className="flex-col items-start gap-0.5">
                  <span className="text-sm font-medium">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.summary}</span>
                </DropdownMenuItem>
              ))}
            </div>
          );
        })}
        {customModes.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="mono-xs uppercase tracking-widest text-muted-foreground">My Modes</DropdownMenuLabel>
            {customModes.map((m) => (
              <DropdownMenuItem key={m.id} onSelect={() => onChange(m.id)} className="flex-col items-start gap-0.5">
                <span className="text-sm font-medium">{m.name}</span>
                <span className="text-xs text-muted-foreground">{m.description ?? "Custom mode"}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
