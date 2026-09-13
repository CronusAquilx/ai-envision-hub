import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { AtSign, Bot, Globe, ImageIcon, ListChecks, Loader2, Paperclip, Send, Square, Wrench } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelector } from "@/components/nexus/ModelSelector";
import { ModeSelector } from "@/components/nexus/ModeSelector";
import { getMode } from "@/lib/nexus/modes";
import { routeTier } from "@/lib/nexus/models";
import { logAgentEvent, saveMessage, updateChat, type Chat, type CustomMode, type DbMessage, type ProjectFile } from "@/lib/nexus/queries";

export type AgentMode = "chat" | "plan" | "agent";

const SLASH_COMMANDS = [
  { cmd: "/plan", hint: "Investigate and write an implementation plan" },
  { cmd: "/agent", hint: "Run autonomously" },
  { cmd: "/fix", hint: "Find and fix the bug" },
  { cmd: "/test", hint: "Write or run tests" },
  { cmd: "/explain", hint: "Explain the selected code" },
  { cmd: "/refactor", hint: "Restructure without changing behaviour" },
  { cmd: "/review", hint: "Review, don't modify" },
  { cmd: "/search", hint: "Search the codebase" },
  { cmd: "/build", hint: "Build the project" },
  { cmd: "/debug", hint: "Diagnose an error" },
  { cmd: "/roblox", hint: "Roblox / Rojo work" },
  { cmd: "/web", hint: "Research on the web" },
  { cmd: "/image", hint: "Generate an image asset" },
  { cmd: "/git", hint: "Git status, diff or commit" },
];

function toUIMessages(rows: DbMessage[]): UIMessage[] {
  return rows.map((row) => ({
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    parts: [{ type: "text", text: row.content }],
  })) as UIMessage[];
}

function textOf(message: UIMessage) {
  return (message.parts ?? [])
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export function ChatPanel({
  chat,
  initialMessages,
  files,
  customModes,
  projectInstructions,
  onChatMeta,
  onAgentEvent,
}: {
  chat: Chat;
  initialMessages: DbMessage[];
  files: ProjectFile[];
  customModes: CustomMode[];
  projectInstructions?: string | null;
  onChatMeta: (patch: Partial<Chat>) => void;
  onAgentEvent: () => void;
}) {
  const [tier, setTier] = useState(chat.model);
  const [mode, setMode] = useState(chat.mode);
  const [agentMode, setAgentMode] = useState<AgentMode>((chat.agent_mode as AgentMode) ?? "chat");
  const [input, setInput] = useState("");
  const [web, setWeb] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef<Set<string>>(new Set(initialMessages.map((m) => m.id)));

  const projectContext = useMemo(() => {
    if (!files.length) return "";
    const tree = files.slice(0, 200).map((f) => `- ${f.path}`).join("\n");
    return `Files in the workspace:\n${tree}`;
  }, [files]);

  const customMode = customModes.find((m) => m.id === mode);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          tier,
          mode: customMode ? "general" : mode,
          agentMode,
          projectContext,
          projectInstructions:
            [projectInstructions, customMode ? `Custom mode "${customMode.name}": ${customMode.instructions}` : null]
              .filter(Boolean)
              .join("\n\n") || undefined,
        }),
      }),
    [tier, mode, agentMode, projectContext, projectInstructions, customMode],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    id: chat.id,
    messages: toUIMessages(initialMessages),
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    inputRef.current?.focus();
  }, [chat.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (error) toast.error(error.message || "The model request failed");
  }, [error]);

  // Persist finished assistant turns.
  useEffect(() => {
    if (status !== "ready") return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || savedRef.current.has(last.id)) return;
    const content = textOf(last);
    if (!content) return;
    savedRef.current.add(last.id);
    void saveMessage({ chatId: chat.id, role: "assistant", content, model: tier }).catch(() => {});
    void logAgentEvent({ chatId: chat.id, kind: "ai", label: `Response complete · ${tier}`, detail: { chars: content.length } })
      .then(onAgentEvent)
      .catch(() => {});
  }, [status, messages, chat.id, tier, onAgentEvent]);

  async function submit() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");

    let nextAgentMode = agentMode;
    let nextTier = tier;
    if (text.startsWith("/plan")) nextAgentMode = "plan";
    if (text.startsWith("/agent")) nextAgentMode = "agent";
    if (text.startsWith("/web") || web) nextTier = "research";
    if (text.startsWith("/image")) nextTier = "image";
    if (nextAgentMode !== agentMode) setAgentMode(nextAgentMode);
    if (nextTier !== tier) setNextTier(nextTier);

    void saveMessage({ chatId: chat.id, role: "user", content: text }).catch(() => {});
    void logAgentEvent({
      chatId: chat.id,
      kind: "ai",
      label: nextAgentMode === "plan" ? "Plan requested" : nextAgentMode === "agent" ? "Agent task started" : "Message sent",
      status: "running",
      detail: { text: text.slice(0, 240) },
    })
      .then(onAgentEvent)
      .catch(() => {});

    if (messages.length === 0) {
      const title = text.length > 60 ? `${text.slice(0, 57)}…` : text;
      onChatMeta({ title });
      void updateChat(chat.id, { title }).catch(() => {});
    }

    await sendMessage({ text });
  }

  function setNextTier(next: string) {
    setTier(next);
    void updateChat(chat.id, { model: next }).catch(() => {});
  }

  function changeMode(next: string) {
    setMode(next);
    onChatMeta({ mode: next });
    void updateChat(chat.id, { mode: next }).catch(() => {});
    const suggested = customModes.find((m) => m.id === next)?.preferred_model ?? getMode(next).preferredTier;
    if (suggested) setNextTier(suggested);
  }

  function changeAgentMode(next: AgentMode) {
    setAgentMode(next);
    onChatMeta({ agent_mode: next });
    void updateChat(chat.id, { agent_mode: next }).catch(() => {});
    setNextTier(routeTier({ agentMode: next }));
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface px-2 py-1.5">
        <ModelSelector value={tier} onChange={setNextTier} />
        <ModeSelector value={mode} onChange={changeMode} customModes={customModes} />
        <div className="ml-auto flex items-center gap-1">
          {(["chat", "plan", "agent"] as AgentMode[]).map((m) => (
            <button
              key={m}
              onClick={() => changeAgentMode(m)}
              className={`mono-xs rounded px-2 py-1 uppercase tracking-wider transition-colors ${
                agentMode === m ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 scrollbar-thin">
        {messages.length === 0 && (
          <div className="mx-auto max-w-lg pt-10 text-center">
            <Bot className="mx-auto size-6 text-primary" />
            <h2 className="mt-4 font-display text-lg font-semibold">What do you want to build?</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Describe the goal. In Plan mode nothing is changed until you approve the plan.
            </p>
            <div className="mt-6 grid gap-2 text-left">
              {["Build a server-authoritative inventory system", "Find and fix the error in this project", "Create a React dashboard with auth"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground/85 transition-colors hover:border-border-strong hover:text-foreground"
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const text = textOf(m);
          return (
            <div key={m.id} className="space-y-1.5">
              <p className="mono-xs uppercase tracking-widest text-muted-foreground">
                {m.role === "user" ? "You" : `NEXUS · ${agentMode}`}
              </p>
              <div className={`whitespace-pre-wrap text-sm leading-relaxed ${m.role === "user" ? "text-foreground" : "text-foreground/90"}`}>
                {text || <span className="text-muted-foreground">…</span>}
              </div>
            </div>
          );
        })}

        {busy && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> {status === "submitted" ? "Thinking…" : "Writing…"}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border bg-surface p-2">
        {input.startsWith("/") && (
          <div className="mb-2 max-h-40 overflow-y-auto rounded-md border border-border bg-elevated p-1 scrollbar-thin">
            {SLASH_COMMANDS.filter((c) => c.cmd.startsWith(input.split(" ")[0] ?? "/")).map((c) => (
              <button
                key={c.cmd}
                onClick={() => setInput(`${c.cmd} `)}
                className="flex w-full items-center gap-3 rounded px-2 py-1 text-left text-xs hover:bg-sidebar-accent"
              >
                <span className="mono-xs text-primary">{c.cmd}</span>
                <span className="text-muted-foreground">{c.hint}</span>
              </button>
            ))}
          </div>
        )}
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" && (e.metaKey || e.ctrlKey)) || (e.key === "Enter" && !e.shiftKey)) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder={
            agentMode === "plan"
              ? "Describe the goal — NEXUS will investigate and plan first…"
              : "Ask, or describe a task. Use / for commands and @ for files."
          }
          className="min-h-[76px] resize-none border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center gap-1 pt-1">
          <Button size="icon" variant="ghost" className="size-7" title="Attach files (desktop bridge)"><Paperclip className="size-3.5" /></Button>
          <Button size="icon" variant="ghost" className="size-7" title="Attach image"><ImageIcon className="size-3.5" /></Button>
          <Button size="icon" variant="ghost" className="size-7" title="Mention a file" onClick={() => setInput((v) => `${v}@`)}>
            <AtSign className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant={web ? "secondary" : "ghost"}
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={() => setWeb((v) => !v)}
          >
            <Globe className="size-3.5" /> Web
          </Button>
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-xs" onClick={() => changeAgentMode("plan")}>
            <ListChecks className="size-3.5" /> Plan
          </Button>
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-xs" onClick={() => changeAgentMode("agent")}>
            <Wrench className="size-3.5" /> Agent
          </Button>
          <div className="ml-auto flex items-center gap-1">
            {busy ? (
              <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={() => stop()}>
                <Square className="size-3" /> Stop
              </Button>
            ) : (
              <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={() => void submit()} disabled={!input.trim()}>
                <Send className="size-3" /> Send
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
