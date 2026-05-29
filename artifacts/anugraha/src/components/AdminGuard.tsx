import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { login } from "@anugraha/api-client-react";

const storageKey = "anugraha_admin_auth";

export function AdminGuard({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(() => {
    try {
      const hasFlag = sessionStorage.getItem(storageKey) === "1";
      const hasToken = typeof window !== "undefined" && !!localStorage.getItem("anugraha_token");
      return hasFlag && hasToken;
    } catch {
      return false;
    }
  });
  const [username, setUsername] = useState(import.meta.env.VITE_ADMIN_USERNAME ?? "admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(username, password);
      sessionStorage.setItem(storageKey, "1");
      setIsAuthed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to sign in");
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthed) return <>{children}</>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071b34] text-white">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full border border-white/10 animate-ring" />
        <div className="absolute right-1/4 top-32 h-96 w-96 rounded-full border border-primary/20 animate-ring [animation-delay:1s]" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(10,102,255,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_24%)]" />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="border-white/10 bg-white/5 p-0 text-white shadow-2xl backdrop-blur-2xl">
            <CardHeader className="space-y-3 p-8 pb-0 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/10">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="text-4xl">Admin Access</CardTitle>
              <p className="text-sm text-white/70">Anugraha Constructions — Owner Portal</p>
            </CardHeader>
            <CardContent className="space-y-4 p-8">
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter admin username"
                autoComplete="username"
                className="border-white/10 bg-white/8 text-white placeholder:text-white/40"
              />
              <motion.div animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }} transition={{ duration: 0.45 }}>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    className="border-white/10 bg-white/8 pr-12 text-white placeholder:text-white/40"
                    onKeyDown={(event) => event.key === "Enter" && submit(event)}
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>
              <AnimatePresence>{error ? <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-rose-300">{error}</motion.p> : null}</AnimatePresence>
              <Button variant="glass" className="w-full" onClick={submit} disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Enter Dashboard"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
