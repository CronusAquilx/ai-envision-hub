import { Check, ChevronDown, Cpu } from "lucide-react";

import { MODEL_TIERS, getTier } from "@/lib/nexus/models";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ModelSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const tier = getTier(value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs">
          <Cpu className="size-3.5 text-primary" />
          {tier.label}
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel className="mono-xs uppercase tracking-widest text-muted-foreground">Model</DropdownMenuLabel>
        {MODEL_TIERS.map((t) => (
          <DropdownMenuItem key={t.id} onSelect={() => onChange(t.id)} className="flex-col items-start gap-0.5 py-2">
            <span className="flex w-full items-center gap-2 text-sm font-medium">
              {t.label}
              {t.badge && <span className="mono-xs rounded bg-primary/15 px-1.5 py-0.5 text-primary">{t.badge}</span>}
              {t.id === tier.id && <Check className="ml-auto size-3.5 text-accent" />}
            </span>
            <span className="text-xs text-muted-foreground">{t.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
