/**
 * The agent loop.
 *
 * understand → inspect → plan → modify → run → verify → summarise, with
 * pause/resume/stop, a question channel and error recovery. Each iteration
 * asks the model for a JSON decision, executes the requested tools through
 * the permissioned tool layer, and feeds the observations back.
 */
import { executeTool, toolCatalogueForPrompt, type ToolCall, type ToolContext } from "./tools";

export interface AgentDecision {
  thought?: string;
  plan?: string[];
  actions?: ToolCall[];
  question?: string;
  done?: boolean;
  summary?: string;
}

export interface AgentStep {
  iteration: number;
  thought: string;
  actions: { call: ToolCall; output: string; ok: boolean }[];
}

export type AgentStatus = "idle" | "running" | "paused" | "waiting" | "done" | "stopped" | "error";

export class AgentController {
  status: AgentStatus = "idle";
  private pausedFlag = false;
  private stoppedFlag = false;
  private answer: ((text: string) => void) | null = null;
  onStatus?: (status: AgentStatus) => void;

  private set(status: AgentStatus) {
    this.status = status;
    this.onStatus?.(status);
  }

  pause() {
    this.pausedFlag = true;
    this.set("paused");
  }
  resume() {
    this.pausedFlag = false;
    this.set("running");
  }
  stop() {
    this.stoppedFlag = true;
    this.pausedFlag = false;
    this.set("stopped");
  }
  reset() {
    this.pausedFlag = false;
    this.stoppedFlag = false;
    this.set("idle");
  }
  get stopped() {
    return this.stoppedFlag;
  }

  /** Called by the UI when the user answers the agent's question. */
  provideAnswer(text: string) {
    this.answer?.(text);
    this.answer = null;
  }

  waitForAnswer() {
    this.set("waiting");
    return new Promise<string>((resolve) => {
      this.answer = (text) => {
        this.set("running");
        resolve(text);
      };
    });
  }

  async gate() {
    while (this.pausedFlag && !this.stoppedFlag) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  markRunning() {
    this.set("running");
  }
  markDone(status: AgentStatus = "done") {
    this.set(status);
  }
}

async function decide(body: Record<string, unknown>): Promise<AgentDecision> {
  const res = await fetch("/api/agent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.text()) || "The agent model request failed");
  return (await res.json()) as AgentDecision;
}

export async function runAgent(options: {
  goal: string;
  tier: string;
  mode: string;
  instructions?: string | null;
  planOnly?: boolean;
  ctx: ToolContext;
  controller: AgentController;
  onStep: (step: AgentStep) => void;
  onPlan?: (plan: string[]) => void;
  onQuestion?: (question: string) => void;
  onSummary: (summary: string) => void;
}) {
  const { goal, tier, mode, ctx, controller, onStep } = options;
  const transcript: string[] = [];
  const max = Math.max(1, options.ctx.permissions.maxIterations);
  controller.reset();
  controller.markRunning();

  const tree = (await ctx.getFiles()).slice(0, 300).map((f) => (f.is_dir ? `${f.path}/` : f.path)).join("\n");

  for (let iteration = 1; iteration <= max; iteration++) {
    await controller.gate();
    if (controller.stopped) return;

    let decision: AgentDecision;
    try {
      decision = await decide({
        goal,
        tier,
        mode,
        instructions: options.instructions ?? undefined,
        planOnly: options.planOnly ?? false,
        iteration,
        maxIterations: max,
        tree,
        transcript: transcript.slice(-24),
        tools: toolCatalogueForPrompt(),
        bridgeConnected: ctx.bridgeConnected && !!ctx.rootPath,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      options.onSummary(`Stopped: ${message}`);
      controller.markDone("error");
      return;
    }

    if (decision.plan?.length) options.onPlan?.(decision.plan);

    const executed: AgentStep["actions"] = [];
    for (const call of decision.actions ?? []) {
      await controller.gate();
      if (controller.stopped) return;
      const result = await executeTool(ctx, call);
      executed.push({ call, output: result.output, ok: result.ok });
      transcript.push(`${call.tool} ${JSON.stringify(call.args).slice(0, 300)} → ${result.ok ? "ok" : "error"}: ${result.output.slice(0, 1200)}`);
    }

    onStep({ iteration, thought: decision.thought ?? "", actions: executed });

    if (decision.question && ctx.permissions.askWhenBlocked) {
      options.onQuestion?.(decision.question);
      const answer = await controller.waitForAnswer();
      if (controller.stopped) return;
      transcript.push(`question: ${decision.question}\nuser answer: ${answer}`);
      continue;
    }

    if (decision.done) {
      options.onSummary(decision.summary || decision.thought || "Task complete.");
      controller.markDone("done");
      return;
    }

    if (!decision.actions?.length && !decision.plan?.length) {
      options.onSummary(decision.summary || decision.thought || "Nothing further to do.");
      controller.markDone("done");
      return;
    }
  }

  options.onSummary(`Reached the iteration limit (${max}). Raise it in Settings → Agent, or send a narrower task.`);
  controller.markDone("done");
}
