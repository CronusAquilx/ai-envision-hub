import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wordmark } from "@/components/nexus/Logo";
import { useSession } from "@/lib/nexus/session";
import { supabase } from "@/integrations/supabase/client";
import {
  createCustomMode,
  deleteCustomMode,
  getSettings,
  listCustomModes,
  saveSettings,
} from "@/lib/nexus/queries";
import { MODEL_TIERS } from "@/lib/nexus/models";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

const SECTIONS = [
  "General", "Appearance", "Editor", "AI", "Agent", "Files", "Terminal", "Git", "Web", "Roblox", "Extensions", "Privacy", "Account",
] as const;

type Section = (typeof SECTIONS)[number];

interface Settings {
  theme: string;
  density: string;
  animations: boolean;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
  defaultTier: string;
  defaultAgentMode: string;
  questionBehaviour: string;
  autonomy: number;
  maxIterations: number;
  filePermission: string;
  terminalPermission: string;
  defaultShell: string;
  gitAutoFetch: boolean;
  researchDepth: string;
  rojoProject: string;
  studioBridge: boolean;
  telemetry: boolean;
  memoryEnabled: boolean;
  globalMemory: string;
  workspaceGrants: string[];
}

const DEFAULTS: Settings = {
  theme: "dark",
  density: "compact",
  animations: true,
  fontSize: 13,
  tabSize: 2,
  wordWrap: false,
  minimap: true,
  autoSave: false,
  defaultTier: "balanced",
  defaultAgentMode: "chat",
  questionBehaviour: "necessary",
  autonomy: 2,
  maxIterations: 12,
  filePermission: "destructive",
  terminalPermission: "safe",
  defaultShell: "auto",
  gitAutoFetch: true,
  researchDepth: "standard",
  rojoProject: "default.project.json",
  studioBridge: false,
  telemetry: false,
  memoryEnabled: true,
  globalMemory: "",
  workspaceGrants: [],
};

const AUTONOMY = ["Manual", "Assisted", "Autonomous", "Full Agent"];

function SettingsPage() {
  const { user, signOut } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [section, setSection] = useState<Section>("General");
  const [filter, setFilter] = useState("");
  const [values, setValues] = useState<Settings>(DEFAULTS);
  const [newMode, setNewMode] = useState({ name: "", description: "", instructions: "", preferred_model: "balanced" });

  const stored = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const modes = useQuery({ queryKey: ["custom-modes"], queryFn: listCustomModes });

  useEffect(() => {
    if (stored.data) setValues({ ...DEFAULTS, ...(stored.data as Partial<Settings>) });
  }, [stored.data]);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    void saveSettings(next as unknown as Record<string, unknown>).catch(() => toast.error("Could not save settings"));
  }

  const visibleSections = useMemo(() => {
    if (!filter.trim()) return SECTIONS as readonly Section[];
    const f = filter.toLowerCase();
    return (SECTIONS as readonly Section[]).filter((s) => s.toLowerCase().includes(f) || SECTION_KEYWORDS[s].some((k) => k.includes(f)));
  }, [filter]);

  useEffect(() => {
    if (visibleSections.length && !visibleSections.includes(section)) setSection(visibleSections[0]!);
  }, [visibleSections, section]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Dashboard
          </Link>
          <Wordmark className="text-foreground" />
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        <aside className="w-48 shrink-0">
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search settings" className="h-8 text-xs" />
          <nav className="mt-3 space-y-0.5">
            {visibleSections.map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`block w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
                  section === s ? "bg-elevated text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <h1 className="font-display text-xl font-semibold">{section}</h1>

          {section === "General" && (
            <Group>
              <Row label="Theme" hint="Applies across editor, panels, chat and terminal.">
                <Select value={values.theme} onValueChange={(v) => set("theme", v)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["dark", "light", "midnight", "blackout", "high-contrast"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
              <Row label="UI density">
                <Select value={values.density} onValueChange={(v) => set("density", v)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Animations"><Switch checked={values.animations} onCheckedChange={(v) => set("animations", v)} /></Row>
            </Group>
          )}

          {section === "Appearance" && (
            <Group>
              <Row label="Editor font size">
                <Input type="number" value={values.fontSize} min={10} max={22} className="w-24" onChange={(e) => set("fontSize", Number(e.target.value))} />
              </Row>
              <Row label="Minimap"><Switch checked={values.minimap} onCheckedChange={(v) => set("minimap", v)} /></Row>
            </Group>
          )}

          {section === "Editor" && (
            <Group>
              <Row label="Tab size"><Input type="number" value={values.tabSize} min={1} max={8} className="w-24" onChange={(e) => set("tabSize", Number(e.target.value))} /></Row>
              <Row label="Word wrap"><Switch checked={values.wordWrap} onCheckedChange={(v) => set("wordWrap", v)} /></Row>
              <Row label="Auto-save"><Switch checked={values.autoSave} onCheckedChange={(v) => set("autoSave", v)} /></Row>
            </Group>
          )}

          {section === "AI" && (
            <Group>
              <Row label="Default model" hint="Models are capability tiers; the provider behind each tier can change without affecting your work.">
                <Select value={values.defaultTier} onValueChange={(v) => set("defaultTier", v)}>
                  <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MODEL_TIERS.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Default mode">
                <Select value={values.defaultAgentMode} onValueChange={(v) => set("defaultAgentMode", v)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="plan">Plan</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label="Ask questions">
                <Select value={values.questionBehaviour} onValueChange={(v) => set("questionBehaviour", v)}>
                  <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always ask</SelectItem>
                    <SelectItem value="necessary">Only when necessary</SelectItem>
                    <SelectItem value="major">Before major changes</SelectItem>
                    <SelectItem value="blocked">Never unless blocked</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
            </Group>
          )}

          {section === "Agent" && (
            <>
              <Group>
                <Row label={`Autonomy — ${AUTONOMY[values.autonomy] ?? "Autonomous"}`} hint="How much the agent may do before checking in.">
                  <Slider className="w-52" min={0} max={3} step={1} value={[values.autonomy]} onValueChange={([v]) => set("autonomy", v ?? 2)} />
                </Row>
                <Row label="Maximum iterations">
                  <Input type="number" value={values.maxIterations} min={1} max={60} className="w-24" onChange={(e) => set("maxIterations", Number(e.target.value))} />
                </Row>
                <Row label="File modification permission">
                  <Select value={values.filePermission} onValueChange={(v) => set("filePermission", v)}>
                    <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Ask every time</SelectItem>
                      <SelectItem value="destructive">Ask for destructive operations</SelectItem>
                      <SelectItem value="auto">Allow automatically</SelectItem>
                      <SelectItem value="restricted">Restricted (read only)</SelectItem>
                    </SelectContent>
                  </Select>
                </Row>
                <Row label="Terminal permission">
                  <Select value={values.terminalPermission} onValueChange={(v) => set("terminalPermission", v)}>
                    <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ask">Ask before commands</SelectItem>
                      <SelectItem value="safe">Allow safe commands</SelectItem>
                      <SelectItem value="auto">Allow automatically</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </Row>
              </Group>

              <section className="space-y-3">
                <h2 className="font-display text-base font-semibold">My Modes</h2>
                {modes.data?.length ? (
                  <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                    {modes.data.map((m) => (
                      <li key={m.id} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span>
                          {m.name}
                          <span className="ml-2 text-xs text-muted-foreground">{m.description}</span>
                        </span>
                        <button
                          aria-label="Delete mode"
                          onClick={() =>
                            void deleteCustomMode(m.id).then(() => queryClient.invalidateQueries({ queryKey: ["custom-modes"] }))
                          }
                        >
                          <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No custom modes yet.</p>
                )}

                <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
                  <p className="mono-xs uppercase tracking-widest text-muted-foreground">Create mode</p>
                  <Input placeholder="FiveM Vehicle Developer" value={newMode.name} onChange={(e) => setNewMode({ ...newMode, name: e.target.value })} />
                  <Input placeholder="Short description" value={newMode.description} onChange={(e) => setNewMode({ ...newMode, description: e.target.value })} />
                  <Textarea
                    placeholder="Instructions the agent must follow in this mode…"
                    className="min-h-24"
                    value={newMode.instructions}
                    onChange={(e) => setNewMode({ ...newMode, instructions: e.target.value })}
                  />
                  <Select value={newMode.preferred_model} onValueChange={(v) => setNewMode({ ...newMode, preferred_model: v })}>
                    <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODEL_TIERS.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={!newMode.name.trim()}
                    onClick={() =>
                      void createCustomMode(newMode)
                        .then(() => {
                          setNewMode({ name: "", description: "", instructions: "", preferred_model: "balanced" });
                          toast.success("Mode created");
                          return queryClient.invalidateQueries({ queryKey: ["custom-modes"] });
                        })
                        .catch(() => toast.error("Could not create the mode"))
                    }
                  >
                    <Plus className="size-4" /> Create Mode
                  </Button>
                </div>
              </section>
            </>
          )}

          {section === "Files" && (
            <Group>
              <Row label="Computer access" hint="Folder access is granted from the desktop app, which hosts the local bridge.">
                <span className="mono-xs rounded bg-elevated px-2 py-1 text-muted-foreground">OFF — no folders granted</span>
              </Row>
              <Row label="Granted folders">
                <span className="mono-xs text-muted-foreground">
                  {values.workspaceGrants.length ? values.workspaceGrants.join(", ") : "none"}
                </span>
              </Row>
            </Group>
          )}

          {section === "Terminal" && (
            <Group>
              <Row label="Default shell">
                <Select value={values.defaultShell} onValueChange={(v) => set("defaultShell", v)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["auto", "powershell", "cmd", "bash", "zsh"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Row>
            </Group>
          )}

          {section === "Git" && (
            <Group>
              <Row label="Auto fetch"><Switch checked={values.gitAutoFetch} onCheckedChange={(v) => set("gitAutoFetch", v)} /></Row>
            </Group>
          )}

          {section === "Web" && (
            <Group>
              <Row label="Research depth">
                <Select value={values.researchDepth} onValueChange={(v) => set("researchDepth", v)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["quick", "standard", "deep"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Row>
            </Group>
          )}

          {section === "Roblox" && (
            <Group>
              <Row label="Rojo project file"><Input value={values.rojoProject} className="w-64" onChange={(e) => set("rojoProject", e.target.value)} /></Row>
              <Row label="Studio bridge" hint="Requires the desktop app and the NEXUS Studio plugin.">
                <Switch checked={values.studioBridge} onCheckedChange={(v) => set("studioBridge", v)} />
              </Row>
            </Group>
          )}

          {section === "Extensions" && (
            <p className="text-sm text-muted-foreground">
              The extension host, marketplace and permission prompts arrive in stage 4 alongside MCP integrations.
            </p>
          )}

          {section === "Privacy" && (
            <Group>
              <Row label="Project & global memory"><Switch checked={values.memoryEnabled} onCheckedChange={(v) => set("memoryEnabled", v)} /></Row>
              <Row label="Telemetry"><Switch checked={values.telemetry} onCheckedChange={(v) => set("telemetry", v)} /></Row>
              <Row label="Global AI preferences" hint="Applied to every project.">
                <Textarea
                  className="min-h-24 w-full"
                  value={values.globalMemory}
                  onChange={(e) => setValues({ ...values, globalMemory: e.target.value })}
                  onBlur={() => set("globalMemory", values.globalMemory)}
                  placeholder="Prefer TypeScript. Short answers. Never add comments unless asked."
                />
              </Row>
            </Group>
          )}

          {section === "Account" && (
            <Group>
              <Row label="Email"><span className="text-sm text-muted-foreground">{user?.email}</span></Row>
              <Row label="Password">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void supabase.auth
                      .resetPasswordForEmail(user?.email ?? "", { redirectTo: `${window.location.origin}/auth` })
                      .then(() => toast.success("Password reset email sent"))
                  }
                >
                  Send reset link
                </Button>
              </Row>
              <Row label="Session">
                <Button size="sm" variant="outline" onClick={() => void signOut().then(() => navigate({ to: "/auth" }))}>
                  Sign out
                </Button>
              </Row>
              <Row label="Delete account" hint="Account deletion is handled by support in this build so your data can be exported first.">
                <Button size="sm" variant="destructive" onClick={() => toast.info("Contact support to delete your account and all data.")}>
                  Request deletion
                </Button>
              </Row>
            </Group>
          )}
        </main>
      </div>
    </div>
  );
}

const SECTION_KEYWORDS: Record<Section, string[]> = {
  General: ["theme", "language", "startup", "confirm"],
  Appearance: ["font", "density", "minimap", "animation"],
  Editor: ["tab", "wrap", "save", "format", "intellisense"],
  AI: ["model", "mode", "thinking", "context"],
  Agent: ["autonomy", "iteration", "permission", "terminal", "questions", "modes"],
  Files: ["workspace", "access", "folder", "ignore"],
  Terminal: ["shell", "powershell", "bash", "zsh", "terminal font"],
  Git: ["fetch", "commit", "branch"],
  Web: ["search", "research", "browser"],
  Roblox: ["rojo", "studio", "mcp", "bridge", "sync"],
  Extensions: ["marketplace", "update", "permission"],
  Privacy: ["memory", "telemetry", "logs", "data"],
  Account: ["profile", "password", "session", "delete"],
};

function Group({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">{children}</div>;
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Label className="text-sm">{label}</Label>
        {hint && <p className="mt-0.5 max-w-md text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
