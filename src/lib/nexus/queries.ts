import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  project_type: string;
  root_path: string | null;
  instructions: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  path: string;
  is_dir: boolean;
  content: string;
  language: string | null;
  updated_at: string;
}

export interface Chat {
  id: string;
  project_id: string | null;
  title: string;
  model: string;
  mode: string;
  agent_mode: string;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  chat_id: string;
  role: string;
  content: string;
  parts: unknown;
  attachments: unknown;
  model: string | null;
  created_at: string;
}

export interface AgentEvent {
  id: string;
  chat_id: string | null;
  project_id: string | null;
  kind: string;
  label: string;
  status: string;
  detail: Record<string, unknown>;
  created_at: string;
}

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

/* ---------- projects ---------- */

export async function listProjects() {
  const { data, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function getProject(id: string) {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

export async function createProject(input: { name: string; project_type?: string; root_path?: string | null; instructions?: string }) {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id, name: input.name, project_type: input.project_type ?? "empty", root_path: input.root_path ?? null, instructions: input.instructions ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, patch: Partial<Project>) {
  const { error } = await supabase.from("projects").update(patch as never).eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- files ---------- */

export async function listFiles(projectId: string) {
  const { data, error } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", projectId)
    .order("path", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProjectFile[];
}

export async function writeFile(projectId: string, path: string, content: string, opts?: { is_dir?: boolean; language?: string | null }) {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("project_files")
    .upsert(
      { user_id, project_id: projectId, path, content, is_dir: opts?.is_dir ?? false, language: opts?.language ?? guessLanguage(path) },
      { onConflict: "project_id,path" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as ProjectFile;
}

export async function renameFile(id: string, path: string) {
  const { error } = await supabase.from("project_files").update({ path, language: guessLanguage(path) }).eq("id", id);
  if (error) throw error;
}

export async function deleteFile(id: string) {
  const { error } = await supabase.from("project_files").delete().eq("id", id);
  if (error) throw error;
}

export function guessLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript", json: "json",
    lua: "lua", luau: "lua", py: "python", rs: "rust", cs: "csharp", cpp: "cpp", c: "c", h: "cpp",
    html: "html", css: "css", scss: "scss", md: "markdown", yml: "yaml", yaml: "yaml", toml: "ini",
    sh: "shell", sql: "sql", go: "go", java: "java", rb: "ruby", php: "php", xml: "xml",
  };
  return map[ext] ?? "plaintext";
}

/* ---------- chats ---------- */

export async function listChats(opts?: { projectId?: string | null; archived?: boolean }) {
  let q = supabase.from("chats").select("*").order("updated_at", { ascending: false });
  if (opts?.projectId) q = q.eq("project_id", opts.projectId);
  q = q.eq("is_archived", opts?.archived ?? false);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Chat[];
}

export async function getChat(id: string) {
  const { data, error } = await supabase.from("chats").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Chat | null;
}

export async function createChat(input: { projectId?: string | null; title?: string; model?: string; mode?: string; agentMode?: string }) {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("chats")
    .insert({
      user_id,
      project_id: input.projectId ?? null,
      title: input.title ?? "New chat",
      model: input.model ?? "balanced",
      mode: input.mode ?? "general",
      agent_mode: input.agentMode ?? "chat",
    })
    .select()
    .single();
  if (error) throw error;
  return data as Chat;
}

export async function updateChat(id: string, patch: Partial<Chat>) {
  const { error } = await supabase.from("chats").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteChat(id: string) {
  const { error } = await supabase.from("chats").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateChat(id: string) {
  const chat = await getChat(id);
  if (!chat) throw new Error("Chat not found");
  const copy = await createChat({
    projectId: chat.project_id,
    title: `${chat.title} (copy)`,
    model: chat.model,
    mode: chat.mode,
    agentMode: chat.agent_mode,
  });
  const msgs = await listMessages(id);
  const user_id = await uid();
  if (msgs.length) {
    const { error } = await supabase.from("messages").insert(
      msgs.map((m) => ({ user_id, chat_id: copy.id, role: m.role, content: m.content, parts: m.parts as never, attachments: m.attachments as never, model: m.model })),
    );
    if (error) throw error;
  }
  return copy;
}

/* ---------- messages ---------- */

export async function listMessages(chatId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbMessage[];
}

export async function saveMessage(input: {
  chatId: string;
  role: string;
  content: string;
  parts?: unknown;
  attachments?: unknown;
  model?: string | null;
}) {
  const user_id = await uid();
  const { error } = await supabase.from("messages").insert({
    user_id,
    chat_id: input.chatId,
    role: input.role,
    content: input.content,
    parts: (input.parts ?? []) as never,
    attachments: (input.attachments ?? []) as never,
    model: input.model ?? null,
  });
  if (error) throw error;
  await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", input.chatId);
}

/* ---------- agent events ---------- */

export async function listAgentEvents(chatId: string) {
  const { data, error } = await supabase
    .from("agent_events")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AgentEvent[];
}

export async function logAgentEvent(input: {
  chatId?: string | null;
  projectId?: string | null;
  kind: string;
  label: string;
  status?: string;
  detail?: Record<string, unknown>;
}) {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("agent_events")
    .insert({
      user_id,
      chat_id: input.chatId ?? null,
      project_id: input.projectId ?? null,
      kind: input.kind,
      label: input.label,
      status: input.status ?? "done",
      detail: (input.detail ?? {}) as never,
    })
    .select()
    .single();
  if (error) throw error;
  return data as AgentEvent;
}

/* ---------- search ---------- */

export async function searchEverything(term: string) {
  const like = `%${term}%`;
  const [chats, messages, projects, files] = await Promise.all([
    supabase.from("chats").select("id,title,project_id,updated_at").ilike("title", like).limit(20),
    supabase.from("messages").select("id,chat_id,content,role,created_at").ilike("content", like).limit(20),
    supabase.from("projects").select("id,name,project_type").ilike("name", like).limit(20),
    supabase.from("project_files").select("id,project_id,path,content").or(`path.ilike.${like},content.ilike.${like}`).limit(30),
  ]);
  return {
    chats: chats.data ?? [],
    messages: messages.data ?? [],
    projects: projects.data ?? [],
    files: files.data ?? [],
  };
}

/* ---------- settings ---------- */

export async function getSettings() {
  const { data, error } = await supabase.from("user_settings").select("settings").maybeSingle();
  if (error) throw error;
  return (data?.settings ?? {}) as Record<string, unknown>;
}

export async function saveSettings(settings: Record<string, unknown>) {
  const user_id = await uid();
  const { error } = await supabase.from("user_settings").upsert({ user_id, settings: settings as never }, { onConflict: "user_id" });
  if (error) throw error;
}

/* ---------- custom modes ---------- */

export interface CustomMode {
  id: string;
  name: string;
  description: string | null;
  instructions: string;
  preferred_model: string;
  tools: unknown;
  permissions: Record<string, unknown>;
  project_types: unknown;
  is_enabled: boolean;
}

export async function listCustomModes() {
  const { data, error } = await supabase.from("custom_modes").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CustomMode[];
}

export async function createCustomMode(input: Partial<CustomMode> & { name: string }) {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("custom_modes")
    .insert({
      user_id,
      name: input.name,
      description: input.description ?? null,
      instructions: input.instructions ?? "",
      preferred_model: input.preferred_model ?? "balanced",
      tools: (input.tools ?? []) as never,
      permissions: (input.permissions ?? {}) as never,
      project_types: (input.project_types ?? []) as never,
    })
    .select()
    .single();
  if (error) throw error;
  return data as CustomMode;
}

export async function updateCustomMode(id: string, patch: Partial<CustomMode>) {
  const { error } = await supabase.from("custom_modes").update(patch as never).eq("id", id);
  if (error) throw error;
}

export async function deleteCustomMode(id: string) {
  const { error } = await supabase.from("custom_modes").delete().eq("id", id);
  if (error) throw error;
}
