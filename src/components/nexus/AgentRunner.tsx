import { useCallback, useMemo, useRef, useState } from "react";
import { CircleStop, ListChecks, Loader2, Pause, Play, Rocket, RotateCcw, Camera } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentController, runAgent, type AgentStatus, type AgentStep } from "@/lib/nexus/agent";
import { captureWorkspace, type ToolContext } from "@/lib/nexus/tools";
import type { Permissions } from "@/lib/nexus/permissions";
import { logAgentEvent, writeFile, type ProjectFile } from "@/lib/nexus/queries";
import { createSnapshot, createTask, updateTask } from "@/lib/nexus/workspace";
import type { PendingChange } from "@/lib/nexus/diff";

export function AgentRunner({
  projectId,
  chatId,
  rootPath,
  bridgeConnected,
  permissions,
  mode,
  tier,
  files,
  refresh,
  onEvent,
  onChange,
  onOutput,
}: {
  projectId: string;
  chatId: string | null;
  rootPath: string | null;
  bridgeConnected: boolean;
  permissions: Permissions;
  mode: string;
  tier: string;
  files: ProjectFile[];
  refresh: () => Promise<void>;
  onEvent: () => void;
  onChange: (change: PendingChange) => void;
  onOutput: (line: string) => void;
}) {
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [plan, setPlan] = useState<string[]>([]);
  const [planOnly, setPlanOnly] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [ask, setAsk] = useState<{ reason: string; resolve: (ok: boolean) => void } | null>(null);
  const controller = useRef(new AgentController());
  const filesRef = useRef(files);
  filesRef.current = files;

  controller.current.onStatus = setStatus;

  const confirm = useCallback(
    (reason: string) => new Promise<boolean>((resolve) => setAsk({ reason, resolve })),
    [],
  );

  const ctx: ToolContext = useMemo(
    () => ({
      projectId,
      rootPath,
      bridgeConnected,
      permissions,
      getFiles: async () => filesRef.current,
      refresh: async () => {
        await refresh();
      },
      log: async (event) => {
        await logAgentEvent({ chatId, projectId, kind: event.kind, label: event.label, status: event.status ?? "done", detail: event.detail ?? {} })
          .then(onEvent)
          .catch(() => {});
        onOutput(`${event.label}`);
      },
      confirm,
      recordChange: onChange,
    }),
    [projectId, rootPath, bridgeConnected, permissions, chatId, refresh, onEvent, onOutput, confirm, onChange],
  );

  const busy = status === "running" || status === "paused" || status === "waiting";

  async function start(only: boolean) {
    const text = goal.trim();
    if (!text || busy) return;
    setSteps([]);
    setPlan([]);
    setSummary(null);
    setPlanOnly(only);

    let taskId: string | null = null;
    try {
      const task = await createTask({ projectId, chatId, goal: text, mode, tier });
      taskId = task.id;
    } catch {
      /* task logging is best-effort */
    }

    if (!only && permissions.files !== "restricted") {
      try {
        await createSnapshot(projectId, `Before: ${text.slice(0, 60)}`, await captureWorkspace(projectId));
      } catch {
        /* snapshots are best-effort */
      }
    }

    await runAgent({
      goal: text,
      tier,
      mode,
      planOnly: only,
      ctx,
      controller: controller.current,
      onStep: (step) => setSteps((s) => [...s, step]),
      onPlan: setPlan,
      onQuestion: setQuestion,
      onSummary: (text2) => {
        setSummary(text2);
        setQuestion(null);
        if (taskId) void updateTask(taskId, { status: "done", summary: text2 }).catch(() => {});
      },
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 border-b border-border bg-surface p-2">
        <div className="flex items-center gap-1.5">
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void start(false);
            }}
            placeholder="Give the agent a task — e.g. add a save system and test it"
            className="h-7 text-xs"
          />
          {busy ? (
            <>
              {status === "paused" ? (
                <Button size="icon" variant="ghost" className="size-7" title="Resume" onClick={() => controller.current.resume()}>
                  <Play className="size-3.5" />
                </Button>
              ) : (
                <Button size="icon" variant="ghost" className="size-7" title="Pause" onClick={() => controller.current.pause()}>
                  <Pause className="size-3.5" />
                </Button>
              )}
              <Button size="icon" variant="ghost" className="size-7" title="Stop" onClick={() => controller.current.stop()}>
                <CircleStop className="size-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button size="icon" className="size-7" title="Run agent" onClick={() => void start(false)}>
                <Rocket className="size-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="size-7" title="Plan only" onClick={() => void start(true)}>
                <ListChecks className="size-3.5" />
              </Button>
            </>
          )}
        </div>
        <p className="mono-xs text-muted-foreground">
          {status === "idle" && `${permissions.autonomy} autonomy · max ${permissions.maxIterations} iterations`}
          {status === "running" && "running"}
          {status === "paused" && "paused"}
          {status === "waiting" && "waiting for your answer"}
          {status === "done" && "finished"}
          {status === "stopped" && "stopped"}
          {status === "error" && "failed"}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2 scrollbar-thin">
        {plan.length > 0 && (
          <div className="rounded border border-border bg-surface/60 p-2">
            <p className="mono-xs uppercase tracking-widest text-muted-foreground">Plan</p>
            <ol className="mt-1.5 space-y-1">
              {plan.map((s, i) => (
                <li key={i} className="text-xs text-foreground/90">
                  {i + 1}. {s}
                </li>
              ))}
            </ol>
            {planOnly && !busy && (
              <div className="mt-2 flex gap-1.5">
                <Button size="sm" className="h-6 text-xs" onClick={() => void start(false)}>
                  Start implementation
                </Button>
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setPlan([])}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {steps.map((step) => (
          <div key={step.iteration} className="rounded border border-border bg-surface/40 p-2">
            <p className="mono-xs text-muted-foreground">step {step.iteration}</p>
            {step.thought && <p className="mt-1 text-xs text-foreground/90">{step.thought}</p>}
            <ul className="mt-1.5 space-y-1">
              {step.actions.map((a, i) => (
                <li key={i} className="mono-xs">
                  <span className="text-primary">🔧 {a.call.tool}</span>{" "}
                  <span className="text-muted-foreground">{String(a.call.args["path"] ?? a.call.args["command"] ?? a.call.args["query"] ?? "")}</span>{" "}
                  <span className={a.ok ? "text-success" : "text-destructive"}>{a.ok ? "completed" : "failed"}</span>
                  <pre className="mt-0.5 max-h-28 overflow-auto whitespace-pre-wrap text-muted-foreground scrollbar-thin">{a.output.slice(0, 700)}</pre>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {question && (
          <div className="rounded border border-warning/40 bg-warning/10 p-2">
            <p className="text-xs text-foreground">{question}</p>
            <div className="mt-1.5 flex gap-1.5">
              <Input value={answer} onChange={(e) => setAnswer(e.target.value)} className="h-7 text-xs" placeholder="Your answer" />
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  controller.current.provideAnswer(answer || "continue with your best judgement");
                  setAnswer("");
                  setQuestion(null);
                }}
              >
                Reply
              </Button>
            </div>
          </div>
        )}

        {summary && (
          <div className="rounded border border-primary/40 bg-primary/5 p-2">
            <p className="mono-xs uppercase tracking-widest text-primary">Summary</p>
            <p className="mt-1 whitespace-pre-wrap text-xs text-foreground/90">{summary}</p>
          </div>
        )}

        {status === "idle" && steps.length === 0 && (
          <p className="px-1 py-6 text-xs leading-relaxed text-muted-foreground">
            The agent inspects the project, plans, edits files, runs commands where it is allowed, checks results and fixes
            what it broke. Every tool call shows up here as it happens.
          </p>
        )}

        {busy && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> working…
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 border-t border-border bg-surface px-2 py-1.5">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 gap-1.5 text-xs"
          onClick={() =>
            void captureWorkspace(projectId)
              .then((f) => createSnapshot(projectId, `Manual ${new Date().toLocaleTimeString()}`, f))
              .then(() => toast.success("Restore point created"))
              .catch(() => toast.error("Could not create a restore point"))
          }
        >
          <Camera className="size-3" /> Restore point
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 gap-1.5 text-xs"
          onClick={() => {
            const last = steps.flatMap((s) => s.actions).reverse().find((a) => a.call.tool === "filesystem.write");
            if (!last) {
              toast.info("No AI file change to undo in this run");
              return;
            }
            const path = String(last.call.args["path"]);
            const previous = files.find((f) => f.path === path);
            void writeFile(projectId, path, previous?.content ?? "")
              .then(refresh)
              .then(() => toast.success(`Reverted ${path}`))
              .catch(() => toast.error("Could not revert that file"));
          }}
        >
          <RotateCcw className="size-3" /> Undo last AI change
        </Button>
      </div>

      {ask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-4">
            <p className="font-display text-sm font-semibold">Approval required</p>
            <p className="mt-2 text-sm text-foreground/85">{ask.reason}</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  ask.resolve(false);
                  setAsk(null);
                }}
              >
                Deny
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  ask.resolve(true);
                  setAsk(null);
                }}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
