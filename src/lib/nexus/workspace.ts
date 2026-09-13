import { supabase } from "@/integrations/supabase/client";

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

/* ---------- agent tasks ---------- */

export interface AgentTask {
  id: string;
  project_id: string | null;
  chat_id: string | null;
  goal: string;
  mode: string;
  tier: string;
  status: string;
  iterations: number;
  summary: string | null;
  created_at: string;
}

export async function createTask(input: { projectId: string; chatId?: string | null; goal: string; mode: string; tier: string }) {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("agent_tasks")
    .insert({ user_id, project_id: input.projectId, chat_id: input.chatId ?? null, goal: input.goal, mode: input.mode, tier: input.tier, status: "running" })
    .select()
    .single();
  if (error) throw error;
  return data as AgentTask;
}

export async function updateTask(id: string, patch: Partial<AgentTask>) {
  const { error } = await supabase.from("agent_tasks").update({ ...patch, updated_at: new Date().toISOString() } as never).eq("id", id);
  if (error) throw error;
}

export async function listTasks(projectId: string) {
  const { data, error } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(25);
  if (error) throw error;
  return (data ?? []) as AgentTask[];
}

/* ---------- snapshots ---------- */

export interface Snapshot {
  id: string;
  project_id: string;
  label: string;
  files: { path: string; content: string; is_dir: boolean }[];
  created_at: string;
}

export async function createSnapshot(projectId: string, label: string, files: { path: string; content: string; is_dir: boolean }[]) {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("snapshots")
    .insert({ user_id, project_id: projectId, label, files: files as never })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Snapshot;
}

export async function listSnapshots(projectId: string) {
  const { data, error } = await supabase
    .from("snapshots")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as unknown as Snapshot[];
}

export async function deleteSnapshot(id: string) {
  const { error } = await supabase.from("snapshots").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- extensions ---------- */

export interface InstalledExtension {
  id: string;
  extension_id: string;
  is_enabled: boolean;
  settings: Record<string, unknown>;
}

export async function listInstalledExtensions() {
  const { data, error } = await supabase.from("installed_extensions").select("*");
  if (error) throw error;
  return (data ?? []) as unknown as InstalledExtension[];
}

export async function installExtension(extensionId: string) {
  const user_id = await uid();
  const { error } = await supabase
    .from("installed_extensions")
    .upsert({ user_id, extension_id: extensionId, is_enabled: true }, { onConflict: "user_id,extension_id" });
  if (error) throw error;
}

export async function setExtensionEnabled(id: string, enabled: boolean) {
  const { error } = await supabase.from("installed_extensions").update({ is_enabled: enabled }).eq("id", id);
  if (error) throw error;
}

export async function uninstallExtension(id: string) {
  const { error } = await supabase.from("installed_extensions").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- integrations (MCP / tools) ---------- */

export interface Integration {
  id: string;
  project_id: string | null;
  kind: string;
  name: string;
  config: Record<string, unknown>;
  permissions: Record<string, unknown>;
  is_enabled: boolean;
}

export async function listIntegrations(projectId?: string | null) {
  let q = supabase.from("integrations").select("*").order("created_at", { ascending: true });
  if (projectId) q = q.eq("project_id", projectId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as Integration[];
}

export async function saveIntegration(input: { id?: string; projectId?: string | null; kind: string; name: string; config?: Record<string, unknown>; permissions?: Record<string, unknown> }) {
  const user_id = await uid();
  if (input.id) {
    const { error } = await supabase
      .from("integrations")
      .update({ name: input.name, config: (input.config ?? {}) as never, permissions: (input.permissions ?? {}) as never })
      .eq("id", input.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("integrations").insert({
    user_id,
    project_id: input.projectId ?? null,
    kind: input.kind,
    name: input.name,
    config: (input.config ?? {}) as never,
    permissions: (input.permissions ?? {}) as never,
  });
  if (error) throw error;
}

export async function setIntegrationEnabled(id: string, enabled: boolean) {
  const { error } = await supabase.from("integrations").update({ is_enabled: enabled }).eq("id", id);
  if (error) throw error;
}

export async function deleteIntegration(id: string) {
  const { error } = await supabase.from("integrations").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- custom tools ---------- */

export interface CustomTool {
  id: string;
  name: string;
  description: string | null;
  command: string;
  ai_invokable: boolean;
  permissions: Record<string, unknown>;
}

export async function listCustomTools() {
  const { data, error } = await supabase.from("custom_tools").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as CustomTool[];
}

export async function createCustomTool(input: { name: string; description?: string; command: string; aiInvokable?: boolean }) {
  const user_id = await uid();
  const { error } = await supabase.from("custom_tools").insert({
    user_id,
    name: input.name,
    description: input.description ?? null,
    command: input.command,
    ai_invokable: input.aiInvokable ?? true,
  });
  if (error) throw error;
}

export async function deleteCustomTool(id: string) {
  const { error } = await supabase.from("custom_tools").delete().eq("id", id);
  if (error) throw error;
}
