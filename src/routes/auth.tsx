import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wordmark } from "@/components/nexus/Logo";
import { useSession } from "@/lib/nexus/session";

type Mode = "signin" | "signup" | "reset" | "update";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — NEXUS AI" },
      { name: "description", content: "Sign in to your NEXUS AI workspace to keep your projects, chats and agent history." },
      { property: "og:title", content: "Sign in — NEXUS AI" },
      { property: "og:description", content: "Access your NEXUS AI development workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { session } = useSession();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) setMode("update");
  }, []);

  useEffect(() => {
    if (session && mode !== "update") navigate({ to: "/dashboard" });
  }, [session, mode, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created", { description: "Check your inbox to confirm your email address." });
        setMode("signin");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Reset link sent", { description: "Follow the link in your email to set a new password." });
        setMode("signin");
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("Password updated");
        navigate({ to: "/dashboard" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) throw new Error(result.error.message ?? "Google sign-in failed");
      if (result.redirected) return;
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in is unavailable");
    }
  }

  const copy: Record<Mode, { title: string; sub: string; cta: string }> = {
    signin: { title: "Sign in", sub: "Continue to your workspace.", cta: "Sign in" },
    signup: { title: "Create your account", sub: "Projects, chats and agent history are saved to your account.", cta: "Create account" },
    reset: { title: "Reset password", sub: "We'll email you a secure reset link.", cta: "Send reset link" },
    update: { title: "Set a new password", sub: "Choose a strong password for your account.", cta: "Update password" },
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-40" />
      <div className="relative w-full max-w-sm">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back
        </Link>
        <Wordmark className="mb-8 text-foreground" />
        <h1 className="font-display text-2xl font-semibold">{copy[mode].title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy[mode].sub}</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />
            </div>
          )}
          {mode !== "update" && (
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.dev" autoComplete="email" />
            </div>
          )}
          {mode !== "reset" && (
            <div className="space-y-1.5">
              <Label htmlFor="password">{mode === "update" ? "New password" : "Password"}</Label>
              <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {copy[mode].cta}
          </Button>
        </form>

        {mode !== "update" && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={google}>
              Continue with Google
            </Button>
          </>
        )}

        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          {mode === "signin" && (
            <>
              <p>
                No account?{" "}
                <button className="text-accent hover:underline" onClick={() => setMode("signup")}>Create one</button>
              </p>
              <p>
                <button className="text-accent hover:underline" onClick={() => setMode("reset")}>Forgot your password?</button>
              </p>
            </>
          )}
          {(mode === "signup" || mode === "reset") && (
            <p>
              <button className="text-accent hover:underline" onClick={() => setMode("signin")}>Back to sign in</button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
