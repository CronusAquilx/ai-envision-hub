import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Archive,
  Bot,
  Boxes,
  FolderTree,
  GitBranch,
  MessageSquare,
  MessageSquarePlus,
  PanelBottom,
  PanelRight,
  Puzzle,
  Search,
  Settings2,
  Star,
  Trash2,
} from "lucide-react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wordmark } from "@/components/nexus/Logo";
import { Explorer } from "@/components/nexus/Explorer";
import { EditorPane, type OpenTab } from "@/components/nexus/EditorPane";
import { ChatPanel } from "@/components/nexus/ChatPanel";
import { AgentPanel } from "@/components/nexus/AgentPanel";
import { TerminalPanel } from "@/components/nexus/TerminalPanel";
import { AgentRunner } from "@/components/nexus/AgentRunner";
import { DiffReview } from "@/components/nexus/DiffReview";
import { CommandPalette, type PaletteCommand } from "@/components/nexus/CommandPalette";
import { ExtensionsPanel, GitPanel, RobloxPanel } from "@/components/nexus/BridgePanels";
import { useBridge } from "@/hooks/useBridge";
import { readPermissions } from "@/lib/nexus/permissions";
import type { PendingChange } from "@/lib/nexus/diff";
import { detectProjectType } from "@/lib/nexus/modes";
import {
  createChat,
  deleteChat,
  deleteFile,
  getProject,
  getSettings,
  listAgentEvents,
  listChats,
  listCustomModes,
  listFiles,
  listMessages,
  renameFile,
  searchEverything,
  updateChat,
  updateProject,
  writeFile,
  type Chat,
  type ProjectFile,
} from "@/lib/nexus/queries";

type SideView = "explorer" | "chats" | "search" | "modes" | "git" | "extensions" | "roblox";

export const Route = createFileRoute("/_authenticated/workspace/$projectId")({
  validateSearch: (search: Record<string, unknown>) => ({
    chat: typeof search['chat'] === "string" ? (search['chat'] as string) : undefined,
  }),
  component: Workspace,
});

function Workspace() {
  const { projectId } = Route.useParams();
  const { chat: chatParam } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [side, setSide] = useState<SideView>("explorer");
  const [tabs, setTabs] = useState<OpenTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [centre, setCentre] = useState<"chat" | "code" | "split">("split");
  const [showTerminal, setShowTerminal] = useState(true);
  const [showSide, setShowSide] = useState(true);
  const [showAgent, setShowAgent] = useState(true);
  const [output, setOutput] = useState<string[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(chatParam ?? null);
  const [term, setTerm] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pending, setPending] = useState<PendingChange[]>([]);
  const [rightTab, setRightTab] = useState<"agent" | "activity" | "changes">("agent");

  const bridge = useBridge();
  const settings = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const permissions = useMemo(() => readPermissions(settings.data ?? undefined), [settings.data]);

  const project = useQuery({ queryKey: ["project", projectId], queryFn: () => getProject(projectId) });
  const files = useQuery({ queryKey: ["files", projectId], queryFn: () => listFiles(projectId) });
  const chats = useQuery({ queryKey: ["chats", projectId], queryFn: () => listChats({ projectId }) });
  const modes = useQuery({ queryKey: ["custom-modes"], queryFn: listCustomModes });
  const events = useQuery({
    queryKey: ["events", activeChatId],
    queryFn: () => (activeChatId ? listAgentEvents(activeChatId) : Promise.resolve([])),
    enabled: !!activeChatId,
  });
  const messages = useQuery({
    queryKey: ["messages", activeChatId],
    queryFn: () => (activeChatId ? listMessages(activeChatId) : Promise.resolve([])),
    enabled: !!activeChatId,
  });
  const results = useQuery({
    queryKey: ["search", term],
    queryFn: () => searchEverything(term),
    enabled: term.trim().length > 1,
  });

  useEffect(() => {
    if (project.data) setInstructions(project.data.instructions ?? "");
  }, [project.data]);

  // Ensure there is always an active chat for this project.
  useEffect(() => {
    if (activeChatId || !chats.data) return;
    if (chats.data.length) setActiveChatId(chats.data[0]!.id);
    else void createChat({ projectId }).then((c) => {
      setActiveChatId(c.id);
      void queryClient.invalidateQueries({ queryKey: ["chats", projectId] });
    });
  }, [chats.data, activeChatId, projectId, queryClient]);

  const detected = useMemo(
    () => detectProjectType((files.data ?? []).map((f) => f.path)),
    [files.data],
  );

  const activeChat = chats.data?.find((c) => c.id === activeChatId) ?? null;

  const refreshFiles = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["files", projectId] }),
    [queryClient, projectId],
  );

  function openFile(file: ProjectFile) {
    if (file.is_dir) return;
    setTabs((prev) =>
      prev.some((t) => t.id === file.id) ? prev : [...prev, { id: file.id, path: file.path, content: file.content, dirty: false }],
    );
    setActiveTab(file.id);
    if (centre === "chat") setCentre("split");
  }

  async function saveTab(id: string) {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    await writeFile(projectId, tab.path, tab.content);
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, dirty: false } : t)));
    await refreshFiles();
    toast.success(`Saved ${tab.path}`);
  }

  async function createEntry(path: string, isDir: boolean) {
    await writeFile(projectId, path, "", { is_dir: isDir });
    await refreshFiles();
  }

  const changedFiles = useMemo(() => {
    const list = files.data ?? [];
    return [...list]
      .filter((f) => !f.is_dir)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 6);
  }, [files.data]);

  const RAIL: { id: SideView; icon: typeof FolderTree; label: string }[] = [
    { id: "explorer", icon: FolderTree, label: "Explorer" },
    { id: "chats", icon: MessageSquare, label: "Chats" },
    { id: "search", icon: Search, label: "Search" },
    { id: "modes", icon: Bot, label: "Agents & modes" },
    { id: "git", icon: GitBranch, label: "Git" },
    { id: "roblox", icon: Boxes, label: "Roblox" },
    { id: "extensions", icon: Puzzle, label: "Extensions" },
  ];

  const commands: PaletteCommand[] = [
    { id: "new-chat", title: "New chat", group: "Chat", run: () => void createChat({ projectId }).then((c) => { setActiveChatId(c.id); void queryClient.invalidateQueries({ queryKey: ["chats", projectId] }); }) },
    { id: "agent", title: "Start agent", group: "Agent", run: () => { setShowAgent(true); setRightTab("agent"); } },
    { id: "plan", title: "Create a plan", group: "Agent", run: () => { setShowAgent(true); setRightTab("agent"); } },
    { id: "changes", title: "Review all changes", group: "Agent", run: () => { setShowAgent(true); setRightTab("changes"); } },
    { id: "terminal", title: "Open terminal", group: "View", shortcut: "Ctrl+J", run: () => setShowTerminal(true) },
    { id: "explorer", title: "Show explorer", group: "View", shortcut: "Ctrl+B", run: () => setSide("explorer") },
    { id: "search", title: "Search files", group: "View", shortcut: "Ctrl+Shift+F", run: () => setSide("search") },
    { id: "git", title: "Git: status and commit", group: "Git", run: () => setSide("git") },
    { id: "roblox", title: "Connect Roblox Studio", group: "Roblox", run: () => setSide("roblox") },
    { id: "ext", title: "Install extension", group: "Extensions", run: () => setSide("extensions") },
    { id: "settings", title: "Open settings", group: "General", run: () => void navigate({ to: "/settings" }) },
    { id: "help", title: "Help centre", group: "General", run: () => void navigate({ to: "/help" }) },
    { id: "dashboard", title: "Open a project", group: "General", run: () => void navigate({ to: "/dashboard" }) },
  ];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "b") {
        e.preventDefault();
        setShowSide((v) => !v);
      } else if (key === "j") {
        e.preventDefault();
        setShowTerminal((v) => !v);
      } else if (e.shiftKey && key === "f") {
        e.preventDefault();
        setSide("search");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* title bar */}
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-border bg-surface px-3">
        <Link to="/dashboard"><Wordmark className="text-foreground" /></Link>
        <span className="mono-xs text-muted-foreground">
          {project.data?.name ?? "…"} · {detected.label}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {(["chat", "split", "code"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setCentre(v)}
              className={`mono-xs rounded px-2 py-1 uppercase tracking-wider ${
                centre === v ? "bg-elevated text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
          <Button size="icon" variant="ghost" className="size-7" aria-label="Toggle terminal" onClick={() => setShowTerminal((v) => !v)}>
            <PanelBottom className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="size-7" aria-label="Toggle agent panel" onClick={() => setShowAgent((v) => !v)}>
            <PanelRight className="size-3.5" />
          </Button>
          <Link to="/settings"><Button size="icon" variant="ghost" className="size-7" aria-label="Settings"><Settings2 className="size-3.5" /></Button></Link>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* activity rail */}
        <nav className="flex w-11 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-2">
          {RAIL.map((item) => (
            <button
              key={item.id}
              title={item.label}
              onClick={() => setSide(item.id)}
              className={`rail-item ${side === item.id ? "bg-sidebar-accent text-primary" : "hover:text-foreground"}`}
            >
              <item.icon className="size-4" />
            </button>
          ))}
        </nav>

        <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
          <ResizablePanel defaultSize="18" minSize="12" className={`bg-sidebar ${showSide ? "" : "hidden"}`}>
            {side === "explorer" && (
              <Explorer
                files={files.data ?? []}
                activePath={tabs.find((t) => t.id === activeTab)?.path ?? null}
                onOpen={openFile}
                onCreate={(path, isDir) => void createEntry(path, isDir)}
                onRename={(file, path) => void renameFile(file.id, path).then(refreshFiles)}
                onDelete={(file) => void deleteFile(file.id).then(refreshFiles)}
              />
            )}

            {side === "chats" && (
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-sidebar-border px-2 py-1.5">
                  <span className="mono-xs uppercase tracking-widest text-muted-foreground">Chats</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6"
                    aria-label="New chat"
                    onClick={() =>
                      void createChat({ projectId }).then((c) => {
                        setActiveChatId(c.id);
                        void queryClient.invalidateQueries({ queryKey: ["chats", projectId] });
                      })
                    }
                  >
                    <MessageSquarePlus className="size-3.5" />
                  </Button>
                </div>
                <ul className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
                  {(chats.data ?? []).map((c) => (
                    <li
                      key={c.id}
                      className={`group flex items-center gap-1 px-2 py-1.5 text-xs ${
                        c.id === activeChatId ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"
                      }`}
                    >
                      <button className="min-w-0 flex-1 truncate text-left" onClick={() => setActiveChatId(c.id)}>
                        {c.title}
                      </button>
                      <button
                        aria-label="Favourite"
                        onClick={() =>
                          void updateChat(c.id, { is_favorite: !c.is_favorite }).then(() =>
                            queryClient.invalidateQueries({ queryKey: ["chats", projectId] }),
                          )
                        }
                      >
                        <Star className={`size-3 ${c.is_favorite ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100"}`} />
                      </button>
                      <button
                        aria-label="Archive"
                        onClick={() =>
                          void updateChat(c.id, { is_archived: true }).then(() =>
                            queryClient.invalidateQueries({ queryKey: ["chats", projectId] }),
                          )
                        }
                      >
                        <Archive className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </button>
                      <button
                        aria-label="Delete"
                        onClick={() =>
                          void deleteChat(c.id).then(() => {
                            if (c.id === activeChatId) setActiveChatId(null);
                            void queryClient.invalidateQueries({ queryKey: ["chats", projectId] });
                          })
                        }
                      >
                        <Trash2 className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {side === "search" && (
              <div className="flex h-full flex-col">
                <div className="border-b border-sidebar-border p-2">
                  <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search everything" className="h-7 text-xs" />
                </div>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2 scrollbar-thin">
                  {!results.data && <p className="text-xs text-muted-foreground">Search chats, messages, projects and file contents.</p>}
                  {results.data?.files.length ? (
                    <div>
                      <p className="mono-xs uppercase tracking-widest text-muted-foreground">Files</p>
                      {results.data.files.map((f) => (
                        <button
                          key={f.id}
                          className="mono-xs block w-full truncate py-0.5 text-left hover:text-primary"
                          onClick={() => {
                            const file = files.data?.find((x) => x.id === f.id);
                            if (file) openFile(file);
                          }}
                        >
                          {f.path}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {results.data?.messages.length ? (
                    <div>
                      <p className="mono-xs uppercase tracking-widest text-muted-foreground">Messages</p>
                      {results.data.messages.map((m) => (
                        <button
                          key={m.id}
                          className="block w-full truncate py-0.5 text-left text-xs text-foreground/80 hover:text-primary"
                          onClick={() => setActiveChatId(m.chat_id)}
                        >
                          {m.content}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {side === "modes" && (
              <div className="flex h-full flex-col">
                <div className="border-b border-sidebar-border px-2 py-1.5">
                  <span className="mono-xs uppercase tracking-widest text-muted-foreground">Project memory</span>
                </div>
                <div className="space-y-2 p-2">
                  <p className="text-xs text-muted-foreground">
                    Instructions the agent follows in this project.
                  </p>
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="min-h-40 text-xs"
                    placeholder={"This is a Roblox FPS. Use Luau.\nServer-authoritative combat.\nAsk before touching the weapon framework."}
                  />
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() =>
                      void updateProject(projectId, { instructions })
                        .then(() => {
                          toast.success("Project instructions saved");
                          void queryClient.invalidateQueries({ queryKey: ["project", projectId] });
                        })
                        .catch(() => toast.error("Could not save instructions"))
                    }
                  >
                    Save instructions
                  </Button>
                  <p className="mono-xs pt-2 text-muted-foreground">
                    Detected: {detected.label} · suggested mode {detected.suggestedMode}
                  </p>
                  <Link to="/settings" className="mono-xs block text-accent hover:underline">
                    Manage modes, permissions and integrations →
                  </Link>
                </div>
              </div>
            )}

            {side === "git" && (
              <GitPanel connected={bridge.connected} rootPath={project.data?.root_path ?? null} tier={activeChat?.model ?? "balanced"} />
            )}

            {side === "roblox" && (
              <RobloxPanel
                health={bridge.health}
                rootPath={project.data?.root_path ?? null}
                detectedRoblox={detected.type === "roblox"}
              />
            )}

            {side === "extensions" && <ExtensionsPanel />}
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={showAgent ? "56" : "82"} minSize="30">
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel defaultSize={showTerminal ? "70" : "100"} minSize="25">
                {centre === "chat" && activeChat && chatBody()}
                {centre === "code" && (
                  <EditorPane
                    tabs={tabs}
                    activeId={activeTab}
                    onActivate={setActiveTab}
                    onClose={(id) => {
                      setTabs((prev) => prev.filter((t) => t.id !== id));
                      if (activeTab === id) setActiveTab(null);
                    }}
                    onChange={(id, value) => setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, content: value, dirty: true } : t)))}
                    onSave={(id) => void saveTab(id)}
                  />
                )}
                {centre === "split" && (
                  <ResizablePanelGroup orientation="horizontal">
                    <ResizablePanel defaultSize="45" minSize="25">{chatBody()}</ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize="55" minSize="25">
                      <EditorPane
                        tabs={tabs}
                        activeId={activeTab}
                        onActivate={setActiveTab}
                        onClose={(id) => {
                          setTabs((prev) => prev.filter((t) => t.id !== id));
                          if (activeTab === id) setActiveTab(null);
                        }}
                        onChange={(id, value) => setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, content: value, dirty: true } : t)))}
                        onSave={(id) => void saveTab(id)}
                      />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                )}
              </ResizablePanel>
              {showTerminal && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize="30" minSize="12">
                    <TerminalPanel
                      files={files.data ?? []}
                      bridgeConnected={bridge.connected}
                      onWriteFile={async (path, content, isDir) => {
                        await writeFile(projectId, path, content, { is_dir: isDir ?? false });
                        await refreshFiles();
                      }}
                      onDeleteFile={async (path) => {
                        const file = files.data?.find((f) => f.path === path);
                        if (!file) throw new Error(`no such file: ${path}`);
                        await deleteFile(file.id);
                        await refreshFiles();
                      }}
                      onOutput={(line) => setOutput((o) => [...o.slice(-200), line])}
                    />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {showAgent && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize="26" minSize="14" className="bg-sidebar">
                <div className="flex h-full min-h-0 flex-col">
                  <div className="flex items-center gap-px border-b border-sidebar-border">
                    {(["agent", "activity", "changes"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setRightTab(t)}
                        className={`mono-xs px-2.5 py-2 uppercase tracking-wider transition-colors ${
                          rightTab === t ? "border-b border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t}
                        {t === "changes" && pending.length > 0 ? ` (${pending.length})` : ""}
                      </button>
                    ))}
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden">
                    {rightTab === "agent" && (
                      <AgentRunner
                        projectId={projectId}
                        chatId={activeChatId}
                        rootPath={project.data?.root_path ?? null}
                        bridgeConnected={bridge.connected}
                        permissions={permissions}
                        mode={activeChat?.mode ?? "general"}
                        tier={activeChat?.model ?? "balanced"}
                        files={files.data ?? []}
                        refresh={async () => {
                          await refreshFiles();
                        }}
                        onEvent={() => void queryClient.invalidateQueries({ queryKey: ["events", activeChatId] })}
                        onChange={(change) => {
                          setPending((prev) => [...prev.filter((c) => c.path !== change.path), change]);
                          setRightTab("changes");
                        }}
                        onOutput={(line) => setOutput((o) => [...o.slice(-200), line])}
                      />
                    )}
                    {rightTab === "activity" && (
                      <AgentPanel events={events.data ?? []} changedFiles={changedFiles} output={output} />
                    )}
                    {rightTab === "changes" && (
                      <div className="h-full overflow-y-auto p-2 scrollbar-thin">
                        <DiffReview
                          changes={pending}
                          onAccept={(change) => setPending((prev) => prev.filter((c) => c.id !== change.id))}
                          onReject={(change) => {
                            void writeFile(projectId, change.path, change.before)
                              .then(refreshFiles)
                              .then(() => toast.success(`Reverted ${change.path}`))
                              .catch(() => toast.error("Could not revert that file"));
                            setPending((prev) => prev.filter((c) => c.id !== change.id));
                          }}
                          onOpen={(path) => {
                            const file = files.data?.find((f) => f.path === path);
                            if (file) openFile(file);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      <div className="flex h-6 shrink-0 items-center gap-3 border-t border-border bg-surface px-3">
        <span className="mono-xs text-muted-foreground">{detected.label}</span>
        <span className="mono-xs text-muted-foreground">{files.data?.length ?? 0} files</span>
        <span className="mono-xs text-muted-foreground">{activeChat ? `${activeChat.mode} · ${activeChat.model}` : "no chat"}</span>
        <span className="mono-xs text-muted-foreground">{permissions.autonomy} autonomy</span>
        <span className="mono-xs ml-auto text-muted-foreground">
          AI online · {bridge.connected ? `bridge connected (${bridge.health?.platform})` : "bridge offline"}
        </span>
      </div>

      <CommandPalette
        commands={commands}
        files={(files.data ?? []).map((f) => ({ id: f.id, path: f.path, is_dir: f.is_dir }))}
        onOpenFile={(id) => {
          const file = files.data?.find((f) => f.id === id);
          if (file) openFile(file);
        }}
      />
    </div>
  );

  function chatBody() {
    if (!activeChat || messages.isLoading) {
      return <div className="mono-xs p-4 text-muted-foreground">Loading chat…</div>;
    }
    return (
      <ChatPanel
        key={activeChat.id}
        chat={activeChat}
        initialMessages={messages.data ?? []}
        files={files.data ?? []}
        customModes={modes.data ?? []}
        projectInstructions={project.data?.instructions ?? null}
        onChatMeta={(patch: Partial<Chat>) => {
          queryClient.setQueryData(["chats", projectId], (old: Chat[] | undefined) =>
            (old ?? []).map((c) => (c.id === activeChat.id ? { ...c, ...patch } : c)),
          );
        }}
        onAgentEvent={() => void queryClient.invalidateQueries({ queryKey: ["events", activeChat.id] })}
      />
    );
  }
}
