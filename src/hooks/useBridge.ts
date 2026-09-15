import { useEffect, useState } from "react";

import { probeBridge, type BridgeHealth } from "@/lib/nexus/bridge";

/** Polls the local desktop bridge so the UI always shows real connection state. */
export function useBridge(intervalMs = 15_000) {
  const [health, setHealth] = useState<BridgeHealth | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    async function tick() {
      const result = await probeBridge();
      if (!alive) return;
      setHealth(result);
      setChecked(true);
    }
    void tick();
    const timer = setInterval(() => void tick(), intervalMs);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [intervalMs]);

  return { health, connected: !!health, checked };
}
