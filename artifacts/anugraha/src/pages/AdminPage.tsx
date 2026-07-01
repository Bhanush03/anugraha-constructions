import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  LayoutDashboard,
  PhoneCall,
  Users,
  Wrench,
  Quote,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Eye,
  ArrowRight,
  BadgeCheck,
  Clock3,
  CircleDot,
  ChevronRight,
  Star,
  Image as ImageIcon,
  Phone,
  Mail,
  UserRound,
  ListChecks,
  Home,
  BriefcaseBusiness,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  X,
  Menu
} from "lucide-react";
import { Link, useLocation } from "wouter";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Skeleton,
  Textarea
} from "@/components/ui";
import {
  getApiBaseUrl,
  useCallbacks,
  useCreateProject,
  useCreateService,
  useCreateTeamMember,
  useCreateTestimonial,
  useDashboardStats,
  useDeleteCallback,
  useDeleteProject,
  useDeleteService,
  useDeleteTeamMember,
  useDeleteTestimonial,
  useProjects,
  useServices,
  useSiteSettings,
  useTeam,
  useTestimonials,
  useUpdateCallback,
  useUpdateProject,
  useUpdateService,
  useUpdateTeamMember,
  useUpdateTestimonial
} from "@anugraha/api-client-react";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: Building2 },
  { label: "Callbacks", href: "/admin/callbacks", icon: PhoneCall },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Services", href: "/admin/services", icon: Wrench },
  { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
  { label: "Settings", href: "/admin/settings", icon: ImageIcon }
];

const serviceIcons = ["Home", "Building2", "BriefcaseBusiness", "ClipboardList", "Sparkles", "ShieldCheck", "Wrench"] as const;

function readAdminImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return reject(new Error("Choose a JPG, PNG, or WEBP image."));
    if (file.size > 5 * 1024 * 1024) return reject(new Error("Image must be 5 MB or smaller."));
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

type ProjectRecord = {
  id: number;
  title: string;
  description: string;
  status: "ongoing" | "completed";
  category: string;
  progress: number;
  location: string;
  value: string;
  startDate: string;
  endDate?: string | null;
  imageUrl: string;
  images: string[];
  featured: boolean;
  phase?: string | null;
};

type CallbackRecord = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  status: "pending" | "contacted" | "resolved";
  createdAt: string;
};

type TeamRecord = {
  id: number;
  name: string;
  role: string;
  bio: string;
  avatarUrl?: string | null;
  order: number;
};

type ServiceRecord = {
  id: number;
  title: string;
  description: string;
  icon: string;
  features: string[];
  order: number;
};

type TestimonialRecord = {
  id: number;
  clientName: string;
  clientTitle: string;
  message: string;
  rating: number;
  avatarUrl?: string | null;
  featured: boolean;
};

type DashboardStatsRecord = {
  totalProjects: number;
  ongoingProjects: number;
  completedProjects: number;
  pendingCallbacks: number;
  totalCallbacks: number;
  happyClients?: number;
  yearsExperience?: number;
  recentCallbacks: CallbackRecord[];
  recentProjects: ProjectRecord[];
  projectsByCategory: Array<{ category: string; count: number }>;
};

function NumberTicker({ value }: { value: number }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    const frame = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setCurrent(Math.floor(value * progress));
      if (progress < 1) window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame(frame);
  }, [value]);
  return <span>{current.toLocaleString()}</span>;
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl font-semibold text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const logout = () => {
    sessionStorage.removeItem("anugraha_admin_auth");
    try { localStorage.removeItem("anugraha_token"); } catch {}
    import('@anugraha/api-client-react').then((mod) => mod.logout()).catch(() => {});
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-[#071b34] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 flex-col border-r border-white/10 bg-[#071b34] px-5 py-6 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-glow"><Building2 className="h-6 w-6" /></div>
            <div>
              <div className="text-lg font-semibold tracking-[0.28em]">ANUGRAHA</div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/55">Admin</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/60">Owner Dashboard</p>
          <nav className="mt-8 grid gap-2">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/8 hover:text-white"><span className="flex items-center gap-3"><Icon className="h-4 w-4" />{item.label}</span><ChevronRight className="h-4 w-4 opacity-50" /></Link>;
            })}
          </nav>
          <div className="mt-auto space-y-3">
            <Link href="/" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              View Live Site <ArrowRight className="h-4 w-4" />
            </Link>
            <button onClick={logout} className="flex w-full items-center justify-between rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">
              Log Out <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>
        <main className="flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(10,102,255,0.16),transparent_25%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_18%),#071b34]">
          <div className="border-b border-white/10 bg-white/5 px-4 py-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="font-semibold tracking-[0.28em]">ANUGRAHA ADMIN</div>
              <button onClick={logout} className="rounded-full border border-white/10 px-3 py-2 text-sm">Log Out</button>
            </div>
          </div>
          <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Clock3 }) {
  return <Card className="rounded-[28px] border-white/10 bg-white/5 text-white shadow-2xl"><CardContent className="flex items-center gap-4 p-6"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><Icon className="h-6 w-6" /></div><div><div className="text-3xl font-semibold"><NumberTicker value={value} /></div><div className="text-sm text-white/65">{label}</div></div></CardContent></Card>;
}

function Modal({ open, title, description, onClose, children }: { open: boolean; title: string; description: string; onClose: () => void; children: ReactNode }) {
  return (
    <Dialog open={open}>
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[#08192f] p-6 text-white shadow-2xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-3xl">{title}</DialogTitle>
                  <DialogDescription>{description}</DialogDescription>
                </div>
                <DialogClose onClick={onClose}><X className="h-4 w-4" /></DialogClose>
              </div>
              {children}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Dialog>
  );
}

function ProgressBar({ value }: { value: number }) {
  return <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} /></div>;
}

function EditableSettingRow({
  label,
  value,
  placeholder,
  onSave,
  isTextarea = false,
  helperText
}: {
  label: string;
  value: string;
  placeholder?: string;
  onSave: (nextValue: string) => void;
  isTextarea?: boolean;
  helperText?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const save = () => {
    onSave(draft);
    setEditing(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">{label}</div>
          <div className="mt-1 break-words text-sm text-white/60">{value || <span className="italic text-white/35">Not set</span>}</div>
          {helperText ? <div className="mt-2 text-xs leading-5 text-white/45">{helperText}</div> : null}
        </div>
        <Button type="button" variant="ghost" className="shrink-0 border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setEditing((current) => !current)}>
          {editing ? "Close" : "Edit"}
        </Button>
      </div>

      {editing ? (
        <div className="mt-4 grid gap-3">
          {isTextarea ? (
            <Textarea value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} />
          ) : (
            <Input value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} />
          )}
          <div className="flex gap-3">
            <Button type="button" onClick={save}>Save</Button>
            <Button type="button" variant="ghost" onClick={() => { setDraft(value); setEditing(false); }}>Cancel</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminTable({ columns, children }: { columns: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-white/75">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.2em] text-white/45">
            <tr>{columns.map((column) => <th key={column} className="px-4 py-4 font-semibold">{column}</th>)}</tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function DashboardPage() {
  const statsQuery = useDashboardStats();
  const stats = statsQuery.data as DashboardStatsRecord | undefined;
  // apply local overrides from admin settings and allow inline editing on dashboard
  const [siteOverrides, setSiteOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("anugraha_site_overrides") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "anugraha_site_overrides") {
        try {
          setSiteOverrides(JSON.parse(ev.newValue || "{}"));
        } catch {
          setSiteOverrides({});
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const writeOverridesLocally = (next: any) => {
    setSiteOverrides(next);
    try {
      localStorage.setItem("anugraha_site_overrides", JSON.stringify(next));
      try {
        window.dispatchEvent(new StorageEvent("storage", { key: "anugraha_site_overrides", newValue: JSON.stringify(next) } as any));
      } catch {
        /* ignore browsers that block StorageEvent constructor */
      }
      try {
        // notify other listeners in same tab (and other tabs that support it)
        window.dispatchEvent(new CustomEvent('anugraha_settings_changed', { detail: next }));
      } catch {
        /* ignore */
      }
    } catch {
      /* ignore */
    }
  };

  const saveSetting = (patch: Record<string, unknown>) => {
    const next = { ...(siteOverrides || {}), ...patch };
    writeOverridesLocally(next);
  };

  const finalStats: DashboardStatsRecord = {
    ...stats,
    totalProjects: siteOverrides.totalProjects ?? stats?.totalProjects,
    ongoingProjects: siteOverrides.ongoingProjects ?? stats?.ongoingProjects,
    completedProjects: siteOverrides.completedProjects ?? stats?.completedProjects,
    pendingCallbacks: siteOverrides.pendingCallbacks ?? stats?.pendingCallbacks,
    happyClients: siteOverrides.happyClients ?? stats?.happyClients ?? 0,
    yearsExperience: siteOverrides.yearsExperience ?? stats?.yearsExperience ?? 0,
    recentCallbacks: stats?.recentCallbacks ?? [],
    recentProjects: stats?.recentProjects ?? [],
    projectsByCategory: stats?.projectsByCategory ?? []
  } as any;

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ totalProjects: finalStats.totalProjects ?? 0, ongoingProjects: finalStats.ongoingProjects ?? 0, completedProjects: finalStats.completedProjects ?? 0, pendingCallbacks: finalStats.pendingCallbacks ?? 0, happyClients: finalStats.happyClients ?? 0, yearsExperience: finalStats.yearsExperience ?? 0 });

  const openEditor = () => {
    setForm({ totalProjects: finalStats.totalProjects ?? 0, ongoingProjects: finalStats.ongoingProjects ?? 0, completedProjects: finalStats.completedProjects ?? 0, pendingCallbacks: finalStats.pendingCallbacks ?? 0, happyClients: finalStats.happyClients ?? 0, yearsExperience: finalStats.yearsExperience ?? 0 });
    setEditOpen(true);
  };

  const saveLocally = () => {
    const next = { ...(siteOverrides || {}), ...form };
    writeOverridesLocally(next);
    alert("Settings saved locally.");
    setEditOpen(false);
  };

  const saveToServer = async () => {
    const next = { ...(siteOverrides || {}), ...form };
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("anugraha_token") : null;
      const resp = await fetch(`${getApiBaseUrl()}/api/settings`, { method: "PUT", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(next) });
      if (!resp.ok) throw new Error("Server error");
      const data = await resp.json();
      writeOverridesLocally(data);
      alert("Saved to server and updated overrides.");
      setEditOpen(false);
    } catch (err) {
      alert("Failed to save to server. Is the API running on port 3001?");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Owner Dashboard" subtitle="Snapshot of projects, callbacks, and recent activity across the portfolio." action={<Button onClick={openEditor} className="gap-2"><Pencil className="h-4 w-4" />Edit Stats</Button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Projects" value={finalStats?.totalProjects ?? 0} icon={Building2} />
        <StatCard label="Ongoing" value={finalStats?.ongoingProjects ?? 0} icon={Clock3} />
        <StatCard label="Completed" value={finalStats?.completedProjects ?? 0} icon={BadgeCheck} />
        <StatCard label="Pending Callbacks" value={finalStats?.pendingCallbacks ?? 0} icon={PhoneCall} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-white shadow-2xl"><CardHeader><CardTitle>Recent Callbacks</CardTitle></CardHeader><CardContent>{statsQuery.isLoading ? <Skeleton className="h-64 rounded-[20px]" /> : <div className="space-y-3">{finalStats?.recentCallbacks.map((callback) => <div key={callback.id} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-start justify-between gap-4"><div><div className="font-semibold">{callback.name}</div><div className="text-sm text-white/60">{callback.phone}</div>{callback.email ? <div className="text-sm text-white/50">{callback.email}</div> : null}</div><Badge tone={callback.status === "pending" ? "warning" : callback.status === "contacted" ? "default" : "success"}>{callback.status}</Badge></div>{callback.message ? <div className="mt-3 text-sm leading-6 text-white/70">{callback.message}</div> : null}</div>)}</div>}</CardContent></Card>
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-white shadow-2xl"><CardHeader><CardTitle>Recent Projects</CardTitle></CardHeader><CardContent>{statsQuery.isLoading ? <Skeleton className="h-64 rounded-[20px]" /> : <div className="space-y-3">{finalStats?.recentProjects.map((project) => <div key={project.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"><img src={project.imageUrl} alt={project.title} className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="font-semibold">{project.title}</div><div className="text-sm text-white/60">{project.location}</div></div><Badge>{project.status}</Badge></div>)}</div>}</CardContent></Card>
      </div>
      <Card className="rounded-[28px] border-white/10 bg-white/5 text-white shadow-2xl"><CardHeader><CardTitle>Projects by Category</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">{finalStats?.projectsByCategory.map((item) => <div key={item.category} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-sm text-white/60">{item.category}</div><div className="mt-2 text-3xl font-semibold">{item.count}</div></div>)}</CardContent></Card>
      <Modal open={editOpen} title="Edit Dashboard Stats" description="Update public-facing stats shown on the homepage." onClose={() => setEditOpen(false)}>
        <form className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input type="number" placeholder="Total Projects" value={form.totalProjects as any} onChange={(e) => setForm((s) => ({ ...s, totalProjects: Number(e.target.value) }))} />
            <Input type="number" placeholder="Ongoing Projects" value={form.ongoingProjects as any} onChange={(e) => setForm((s) => ({ ...s, ongoingProjects: Number(e.target.value) }))} />
            <Input type="number" placeholder="Completed Projects" value={form.completedProjects as any} onChange={(e) => setForm((s) => ({ ...s, completedProjects: Number(e.target.value) }))} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input type="number" placeholder="Pending Callbacks" value={form.pendingCallbacks as any} onChange={(e) => setForm((s) => ({ ...s, pendingCallbacks: Number(e.target.value) }))} />
            <Input type="number" placeholder="Happy Clients" value={form.happyClients as any} onChange={(e) => setForm((s) => ({ ...s, happyClients: Number(e.target.value) }))} />
            <Input type="number" placeholder="Years of Experience" value={form.yearsExperience as any} onChange={(e) => setForm((s) => ({ ...s, yearsExperience: Number(e.target.value) }))} />
          </div>
          <div className="flex gap-3">
            <Button onClick={saveLocally} type="button">Save Locally</Button>
            <Button onClick={saveToServer} className="bg-primary" type="button">Save To Server</Button>
            <Button variant="ghost" onClick={() => { setForm({ totalProjects: finalStats.totalProjects ?? 0, ongoingProjects: finalStats.ongoingProjects ?? 0, completedProjects: finalStats.completedProjects ?? 0, pendingCallbacks: finalStats.pendingCallbacks ?? 0, happyClients: finalStats.happyClients ?? 0, yearsExperience: finalStats.yearsExperience ?? 0 }); }}>Reset</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ProjectsPage() {
  const query = useProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tagsText, setTagsText] = useState("");
  const [form, setForm] = useState({ title: "", description: "", status: "ongoing", category: "Residential", progress: 0, location: "", value: "", startDate: "", endDate: "", imageUrl: "", featured: false, phase: "", images: "" });

  const openEditor = (project?: any) => {
    if (project) {
      setEditingId(project.id);
      setForm({
        title: project.title,
        description: project.description,
        status: project.status,
        category: project.category,
        progress: project.progress,
        location: project.location,
        value: project.value,
        startDate: project.startDate,
        endDate: project.endDate ?? "",
        imageUrl: project.imageUrl,
        featured: project.featured,
        phase: project.phase ?? "",
        images: project.images.join("\n")
      });
      setTagsText(project.images.join("\n"));
    } else {
      setEditingId(null);
      setForm({ title: "", description: "", status: "ongoing", category: "Residential", progress: 0, location: "", value: "", startDate: "", endDate: "", imageUrl: "", featured: false, phase: "", images: "" });
      setTagsText("");
    }
    setOpen(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...form, images: tagsText.split("\n").map((item: string) => item.trim()).filter(Boolean), endDate: form.endDate || null, phase: form.phase || null };
    // client-side validation before sending to server to avoid 400 from Zod
    const missing: string[] = [];
    if (!payload.title || String(payload.title).trim().length === 0) missing.push("Title");
    if (!payload.description || String(payload.description).trim().length === 0) missing.push("Description");
    if (!payload.location || String(payload.location).trim().length === 0) missing.push("Location");
    if (!payload.value || String(payload.value).trim().length === 0) missing.push("Value");
    if (!payload.startDate || String(payload.startDate).trim().length === 0) missing.push("Start date");
    if (!payload.imageUrl || String(payload.imageUrl).trim().length === 0) missing.push("Project image");
    if (typeof payload.progress !== "number" || payload.progress < 0 || payload.progress > 100) missing.push("Progress (0-100)");
    if (missing.length > 0) {
      alert("Please fill required fields: " + missing.join(", "));
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload } as any);
      } else {
        await createMutation.mutateAsync(payload as any);
      }
      setOpen(false);
    } catch (err) {
      alert("Failed to save project: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" subtitle="Manage the portfolio, featured homepage items, and construction progress details." action={<Button onClick={() => openEditor()} className="gap-2"><Plus className="h-4 w-4" />Add Project</Button>} />
      <AdminTable columns={["Thumbnail", "Title", "Location", "Status", "Category", "Value", "Progress", "Actions"]}>
        {query.isLoading ? Array.from({ length: 4 }).map((_, index) => <tr key={index}><td colSpan={8} className="p-4"><Skeleton className="h-20 rounded-[20px]" /></td></tr>) : ((query.data ?? []) as any[]).map((project) => <tr key={project.id} className="border-t border-white/10 align-top"><td className="px-4 py-4"><img src={project.imageUrl} alt={project.title} className="h-16 w-24 rounded-xl object-cover" /></td><td className="px-4 py-4"><div className="font-semibold text-white">{project.title}</div><div className="text-xs text-white/55">{project.phase ?? "-"}</div>{project.featured ? <Badge className="mt-2">Featured</Badge> : null}</td><td className="px-4 py-4">{project.location}</td><td className="px-4 py-4"><Badge tone={project.status === "completed" ? "success" : "warning"}>{project.status}</Badge></td><td className="px-4 py-4">{project.category}</td><td className="px-4 py-4">{project.value}</td><td className="px-4 py-4 w-56"><ProgressBar value={project.progress} /><div className="mt-1 text-xs text-white/50">{project.progress}%</div></td><td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => openEditor(project)} className="rounded-full border border-white/10 px-3 py-2"><Pencil className="h-4 w-4" /></button><button onClick={() => deleteMutation.mutate(project.id)} className="rounded-full border border-rose-400/20 px-3 py-2 text-rose-300"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
      </AdminTable>
      <Modal open={open} title={editingId ? "Edit Project" : "Add Project"} description="Use short, accurate details. Upload the project image directly." onClose={() => setOpen(false)}>
        <form onSubmit={save} className="flex flex-col">
          <div className="grid gap-4 overflow-auto pr-4" style={{ maxHeight: '60vh' }}>
            <div className="grid gap-4 md:grid-cols-2"><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Title" required /><Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" required /></div>
            <div className="grid gap-4 md:grid-cols-2"><Input value={form.value} onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))} placeholder="Value" /><Input value={form.phase} onChange={(event) => setForm((current) => ({ ...current, phase: event.target.value }))} placeholder="Phase" /></div>
            <div className="grid gap-4 md:grid-cols-3"><select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"><option>Residential</option><option>Commercial</option><option>Industrial</option><option>Infrastructure</option><option>Renovation</option></select><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"><option value="ongoing">ongoing</option><option value="completed">completed</option></select><Input type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} /></div>
            <div className="grid gap-4 md:grid-cols-2"><Input type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} /><div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">Project image is upload-only</div></div>
            <div className="grid gap-2">
              <label className="text-sm text-white/70">Upload project image</label>
              <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try { const dataUrl = await readAdminImage(file); setForm((current) => ({ ...current, imageUrl: dataUrl })); } catch (error) { alert(error instanceof Error ? error.message : "Unable to read image."); event.target.value = ""; }
              }} />
            </div>
            {form.imageUrl ? <img src={form.imageUrl} alt="preview" className="h-48 w-full rounded-[24px] object-cover" /> : null}
            {form.imageUrl ? <div className="inline-flex w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Done</div> : null}
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Input type="range" min={0} max={100} value={form.progress} onChange={(event) => setForm((current) => ({ ...current, progress: Number(event.target.value) }))} />
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">{form.progress}%</div>
            </div>
            <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" />
            <div className="grid gap-2">
              <label className="text-sm text-white/70">Project gallery images</label>
              <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={async (event) => {
                const files = Array.from(event.target.files ?? []);
                try {
                  const images = await Promise.all(files.map(readAdminImage));
                  setTagsText((current) => [current, ...images].filter(Boolean).join("\n"));
                } catch (error) {
                  alert(error instanceof Error ? error.message : "Unable to read gallery images.");
                }
                event.target.value = "";
              }} />
              <Textarea value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="Uploaded images or one image URL per line" />
            </div>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} /> Show as featured project on homepage</label>
          </div>
          <div className="sticky bottom-0 z-50 bg-gradient-to-t from-transparent to-white/5 dark:to-[#071b34] px-4 py-3 flex items-center gap-3">
            <Button type="submit" className="flex-1 bg-primary text-white">Save Project</Button>
            <Button type="button" className="flex-0 border border-white/10" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function CallbacksPage() {
  const query = useCallbacks();
  const updateMutation = useUpdateCallback();
  const deleteMutation = useDeleteCallback();
  const counts = useMemo(() => {
    const callbacks = query.data ?? [];
    return {
      pending: callbacks.filter((item) => item.status === "pending").length,
      contacted: callbacks.filter((item) => item.status === "contacted").length,
      resolved: callbacks.filter((item) => item.status === "resolved").length
    };
  }, [query.data]);

  return (
    <div className="space-y-6">
      <PageHeader title="Callbacks" subtitle="Track inbound inquiries and move them through the owner workflow." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pending" value={counts.pending} icon={PhoneCall} />
        <StatCard label="Contacted" value={counts.contacted} icon={ListChecks} />
        <StatCard label="Resolved" value={counts.resolved} icon={BadgeCheck} />
      </div>
      <AdminTable columns={["Name", "Phone", "Email", "Message", "Date", "Status", "Actions"]}>
        {query.data?.map((callback) => <tr key={callback.id} className="border-t border-white/10 align-top"><td className="px-4 py-4 font-semibold text-white">{callback.name}</td><td className="px-4 py-4"><a href={`tel:${callback.phone}`} className="text-primary">{callback.phone}</a></td><td className="px-4 py-4"><a href={`mailto:${callback.email ?? ""}`} className="text-primary">{callback.email ?? "-"}</a></td><td className="px-4 py-4 max-w-md text-white/65">{callback.message ?? "-"}</td><td className="px-4 py-4">{new Date(callback.createdAt).toLocaleDateString()}</td><td className="px-4 py-4"><Badge tone={callback.status === "pending" ? "warning" : callback.status === "contacted" ? "default" : "success"}>{callback.status}</Badge></td><td className="px-4 py-4"><div className="flex flex-wrap gap-2">{callback.status === "pending" ? <button onClick={() => updateMutation.mutate({ id: callback.id, payload: { status: "contacted" } })} className="rounded-full border border-white/10 px-3 py-2 text-xs">Mark Contacted</button> : null}{callback.status !== "resolved" ? <button onClick={() => updateMutation.mutate({ id: callback.id, payload: { status: "resolved" } })} className="rounded-full border border-white/10 px-3 py-2 text-xs">Resolve</button> : null}<button onClick={() => deleteMutation.mutate(callback.id)} className="rounded-full border border-rose-400/20 px-3 py-2 text-xs text-rose-300"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
      </AdminTable>
    </div>
  );
}

function TeamPage() {
  const query = useTeam();
  const createMutation = useCreateTeamMember();
  const updateMutation = useUpdateTeamMember();
  const deleteMutation = useDeleteTeamMember();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", role: "", bio: "", avatarUrl: "", order: 0, website: "", linkedin: "", instagram: "" });

  const openEditor = (member?: any) => {
    if (member) {
      setEditingId(member.id);
      setForm({ name: member.name, role: member.role, bio: member.bio, avatarUrl: member.avatarUrl ?? "", order: member.order, website: member.socialLinks?.website ?? "", linkedin: member.socialLinks?.linkedin ?? "", instagram: member.socialLinks?.instagram ?? "" });
    } else {
      setEditingId(null);
      setForm({ name: "", role: "", bio: "", avatarUrl: "", order: 0, website: "", linkedin: "", instagram: "" });
    }
    setOpen(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const { website, linkedin, instagram, ...member } = form;
    const payload = { ...member, avatarUrl: form.avatarUrl || null, socialLinks: Object.fromEntries(Object.entries({ website, linkedin, instagram }).filter(([, value]) => value)) };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload } as any);
      } else {
        await createMutation.mutateAsync(payload as any);
      }
      setOpen(false);
    } catch (err) {
      alert("Failed to save team member: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Team" subtitle="Maintain the leadership and delivery team showcased on the public site." action={<Button onClick={() => openEditor()} className="gap-2"><Plus className="h-4 w-4" />Add Member</Button>} />
      <AdminTable columns={["Avatar", "Name", "Role", "Bio", "Order", "Actions"]}>
        {((query.data ?? []) as any[]).map((member) => <tr key={member.id} className="border-t border-white/10"><td className="px-4 py-4"><Avatar className="h-12 w-12 border border-white/10">{member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.name} /> : <AvatarFallback>{member.name.split(" ").map((part: string) => part[0]).join("").slice(0, 2)}</AvatarFallback>}</Avatar></td><td className="px-4 py-4"><div className="font-semibold text-white">{member.name}</div><div className="text-xs text-white/50">{member.role}</div></td><td className="px-4 py-4">{member.role}</td><td className="px-4 py-4 max-w-lg text-white/65">{member.bio}</td><td className="px-4 py-4">{member.order}</td><td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => openEditor(member)} className="rounded-full border border-white/10 px-3 py-2"><Pencil className="h-4 w-4" /></button><button onClick={() => deleteMutation.mutate(member.id)} className="rounded-full border border-rose-400/20 px-3 py-2 text-rose-300"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
      </AdminTable>
      <Modal open={open} title={editingId ? "Edit Team Member" : "Add Team Member"} description="Use a short biography and a direct role title." onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={save}>
          <div className="grid gap-4 md:grid-cols-2"><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name" /><Input value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} placeholder="Role" /></div>
          <div className="grid gap-4 md:grid-cols-2"><Input value={form.avatarUrl} onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))} placeholder="Avatar URL" /><Input type="number" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: Number(event.target.value) }))} /></div>
          <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const avatarUrl = await readAdminImage(file); setForm((current) => ({ ...current, avatarUrl })); } catch (error) { alert(error instanceof Error ? error.message : "Unable to read image."); event.target.value = ""; } }} />
          {form.avatarUrl ? <div className="flex items-center gap-3"><img src={form.avatarUrl} alt="Team member preview" className="h-24 w-24 rounded-2xl object-cover" /><Button type="button" variant="ghost" onClick={() => setForm((current) => ({ ...current, avatarUrl: "" }))}>Remove photo</Button></div> : null}
          <Textarea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} placeholder="Bio" />
          <div className="grid gap-4 md:grid-cols-3"><Input type="url" value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} placeholder="Website URL" /><Input type="url" value={form.linkedin} onChange={(event) => setForm((current) => ({ ...current, linkedin: event.target.value }))} placeholder="LinkedIn URL" /><Input type="url" value={form.instagram} onChange={(event) => setForm((current) => ({ ...current, instagram: event.target.value }))} placeholder="Instagram URL" /></div>
          <Button type="submit" className="w-full">Save Member</Button>
        </form>
      </Modal>
    </div>
  );
}

function ServicesPage() {
  const query = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [featureText, setFeatureText] = useState("");
  const [form, setForm] = useState({ title: "", description: "", icon: "Home", order: 0 });
  const [imageError, setImageError] = useState("");

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      reject(new Error("Choose a JPG, PNG, or WEBP image."));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Image must be 5 MB or smaller."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

  const openEditor = (service?: any) => {
    if (service) {
      setEditingId(service.id);
      setForm({ title: service.title, description: service.description, icon: service.icon, order: service.order });
      setFeatureText(service.features.join("\n"));
    } else {
      setEditingId(null);
      setForm({ title: "", description: "", icon: "Home", order: 0 });
      setFeatureText("");
    }
    setImageError("");
    setOpen(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...form, features: featureText.split("\n").map((item: string) => item.trim()).filter(Boolean) };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload } as any);
      } else {
        await createMutation.mutateAsync(payload as any);
      }
      setOpen(false);
    } catch (err) {
      alert("Failed to save service: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Services" subtitle="Control the service cards and feature tags shown to prospective clients." action={<Button onClick={() => openEditor()} className="gap-2"><Plus className="h-4 w-4" />Add Service</Button>} />
      <AdminTable columns={["Order", "Title", "Description", "Features", "Actions"]}>
        {((query.data ?? []) as any[]).map((service) => <tr key={service.id} className="border-t border-white/10"><td className="px-4 py-4">{service.order}</td><td className="px-4 py-4 font-semibold text-white">{service.title}<div className="text-xs text-white/50">{service.icon}</div></td><td className="px-4 py-4 max-w-xl text-white/65">{service.description}</td><td className="px-4 py-4"><div className="flex flex-wrap gap-2">{service.features.slice(0, 3).map((feature: string) => <Badge key={feature}>{feature}</Badge>)}{service.features.length > 3 ? <Badge tone="muted">+{service.features.length - 3}</Badge> : null}</div></td><td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => openEditor(service)} className="rounded-full border border-white/10 px-3 py-2"><Pencil className="h-4 w-4" /></button><button onClick={() => deleteMutation.mutate(service.id)} className="rounded-full border border-rose-400/20 px-3 py-2 text-rose-300"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
      </AdminTable>
      <Modal open={open} title={editingId ? "Edit Service" : "Add Service"} description="Use a Lucide icon name and one feature per line." onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={save}>
          <div className="grid gap-4 md:grid-cols-3"><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Title" /><Input value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} placeholder="Icon name or image data" /><Input type="number" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: Number(event.target.value) }))} /></div>
          <div className="grid gap-2">
            <label className="text-sm text-white/70">Upload service image</label>
            <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                setImageError("");
                const dataUrl = await readFileAsDataUrl(file);
                setForm((current) => ({ ...current, icon: dataUrl }));
              } catch (error) {
                setImageError(error instanceof Error ? error.message : "Unable to read image.");
                event.target.value = "";
              }
            }} />
            {imageError ? <p className="text-sm text-rose-300">{imageError}</p> : null}
          </div>
          {form.icon.startsWith("data:") || form.icon.startsWith("/images/") || form.icon.startsWith("http") ? <div className="flex items-center gap-3"><img src={form.icon} alt="service preview" className="h-24 w-24 rounded-2xl object-cover" /><Button type="button" variant="ghost" onClick={() => setForm((current) => ({ ...current, icon: "Home" }))}>Remove image</Button></div> : null}
          <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" />
          <Textarea value={featureText} onChange={(event) => setFeatureText(event.target.value)} placeholder="Features, one per line" />
          <Button type="submit" className="w-full">Save Service</Button>
        </form>
      </Modal>
    </div>
  );
}

function TestimonialsPage() {
  const query = useTestimonials();
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ clientName: "", clientTitle: "", message: "", rating: 5, avatarUrl: "", featured: false });

  const openEditor = (testimonial?: any) => {
    if (testimonial) {
      setEditingId(testimonial.id);
      setForm({ clientName: testimonial.clientName, clientTitle: testimonial.clientTitle, message: testimonial.message, rating: testimonial.rating, avatarUrl: testimonial.avatarUrl ?? "", featured: testimonial.featured });
    } else {
      setEditingId(null);
      setForm({ clientName: "", clientTitle: "", message: "", rating: 5, avatarUrl: "", featured: false });
    }
    setOpen(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...form, avatarUrl: form.avatarUrl || null };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload } as any);
      } else {
        await createMutation.mutateAsync(payload as any);
      }
      setOpen(false);
    } catch (err) {
      alert("Failed to save testimonial: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Testimonials" subtitle="Curate the client quotes and featured review carousel on the home page." action={<Button onClick={() => openEditor()} className="gap-2"><Plus className="h-4 w-4" />Add Testimonial</Button>} />
      <AdminTable columns={["Client", "Message", "Rating", "Featured", "Actions"]}>
        {((query.data ?? []) as any[]).map((testimonial) => <tr key={testimonial.id} className="border-t border-white/10"><td className="px-4 py-4"><div className="font-semibold text-white">{testimonial.clientName}</div><div className="text-xs text-white/55">{testimonial.clientTitle}</div></td><td className="px-4 py-4 max-w-xl text-white/65">{testimonial.message}</td><td className="px-4 py-4"><div className="flex gap-1 text-amber-300">{Array.from({ length: testimonial.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}</div></td><td className="px-4 py-4">{testimonial.featured ? <Badge>Featured</Badge> : <Badge tone="muted">No</Badge>}</td><td className="px-4 py-4"><div className="flex gap-2"><button onClick={() => openEditor(testimonial)} className="rounded-full border border-white/10 px-3 py-2"><Pencil className="h-4 w-4" /></button><button onClick={() => deleteMutation.mutate(testimonial.id)} className="rounded-full border border-rose-400/20 px-3 py-2 text-rose-300"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
      </AdminTable>
      <Modal open={open} title={editingId ? "Edit Testimonial" : "Add Testimonial"} description="Only featured testimonials appear in the marquee on the public site." onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={save}>
          <div className="grid gap-4 md:grid-cols-2"><Input value={form.clientName} onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))} placeholder="Client name" /><Input value={form.clientTitle} onChange={(event) => setForm((current) => ({ ...current, clientTitle: event.target.value }))} placeholder="Client title" /></div>
          <div className="grid gap-4 md:grid-cols-2"><Input type="number" min={1} max={5} value={form.rating} onChange={(event) => setForm((current) => ({ ...current, rating: Number(event.target.value) }))} /><Input value={form.avatarUrl} onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))} placeholder="Avatar URL" /></div>
          <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const avatarUrl = await readAdminImage(file); setForm((current) => ({ ...current, avatarUrl })); } catch (error) { alert(error instanceof Error ? error.message : "Unable to read image."); event.target.value = ""; } }} />
          {form.avatarUrl ? <div className="flex items-center gap-3"><img src={form.avatarUrl} alt="Testimonial preview" className="h-24 w-24 rounded-2xl object-cover" /><Button type="button" variant="ghost" onClick={() => setForm((current) => ({ ...current, avatarUrl: "" }))}>Remove photo</Button></div> : null}
          <Textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Message" />
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} /> Featured testimonial</label>
          <Button type="submit" className="w-full">Save Testimonial</Button>
        </form>
      </Modal>
    </div>
  );
}

function SettingsPage() {
  const settingsQuery = useSiteSettings();
  const [overrides, setOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("anugraha_site_overrides") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setOverrides(settingsQuery.data);
      localStorage.setItem("anugraha_site_overrides", JSON.stringify(settingsQuery.data));
    }
  }, [settingsQuery.data]);

  const update = (patch: any) => {
    const next = { ...overrides, ...patch };
    setOverrides(next);
    localStorage.setItem("anugraha_site_overrides", JSON.stringify(next));
  };

  const clear = () => {
    setOverrides({});
    localStorage.removeItem("anugraha_site_overrides");
  };

  const saveToServer = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("anugraha_token") : null;
      const resp = await fetch(`${getApiBaseUrl()}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(overrides)
      });
      if (!resp.ok) throw new Error("Server error");
      const data = await resp.json();
      setOverrides(data);
      localStorage.setItem("anugraha_site_overrides", JSON.stringify(data));
      try { window.dispatchEvent(new CustomEvent('anugraha_settings_changed', { detail: data })); } catch {}
      alert("Saved to server and updated overrides.");
    } catch (err) {
      alert("Failed to save to server. Is the API running on port 3001?");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Site Settings" subtitle="Edit public homepage content and dashboard overrides (stored locally)." />

      <Card className="rounded-[20px] border-white/10 bg-white/5 text-white shadow-2xl"><CardHeader><CardTitle>Hero</CardTitle></CardHeader><CardContent>
        <div className="grid gap-3">
          <Input placeholder="Hero headline" value={overrides.heroHeadline ?? ""} onChange={(e) => update({ heroHeadline: e.target.value })} />
          <Input placeholder="Hero subtitle" value={overrides.heroSubtitle ?? ""} onChange={(e) => update({ heroSubtitle: e.target.value })} />
          <Input placeholder="Background image path (e.g. /images/hero-bg.jpg)" value={overrides.heroImage ?? "/images/hero-bg.jpg"} onChange={(e) => update({ heroImage: e.target.value })} />
          <div className="grid gap-2">
            <label className="text-sm">Upload hero image</label>
            <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try { update({ heroImage: await readAdminImage(file) }); } catch (error) { alert(error instanceof Error ? error.message : "Unable to read image."); e.target.value = ""; }
            }} />
            {overrides.heroImage ? <img src={overrides.heroImage} alt="hero preview" className="h-40 w-full object-cover rounded-md" /> : null}
          </div>
        </div>
      </CardContent></Card>

      <Card className="rounded-[20px] border-white/10 bg-white/5 text-white shadow-2xl"><CardHeader><CardTitle>Stats Overrides</CardTitle></CardHeader><CardContent>
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Total Projects" type="number" value={overrides.totalProjects ?? ""} onChange={(e) => update({ totalProjects: Number(e.target.value) })} />
          <Input placeholder="Ongoing Projects" type="number" value={overrides.ongoingProjects ?? ""} onChange={(e) => update({ ongoingProjects: Number(e.target.value) })} />
          <Input placeholder="Completed Projects" type="number" value={overrides.completedProjects ?? ""} onChange={(e) => update({ completedProjects: Number(e.target.value) })} />
          <Input placeholder="Pending Callbacks" type="number" value={overrides.pendingCallbacks ?? ""} onChange={(e) => update({ pendingCallbacks: Number(e.target.value) })} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input placeholder="Happy Clients" type="number" value={overrides.happyClients ?? ""} onChange={(e) => update({ happyClients: Number(e.target.value) })} />
          <Input placeholder="Years of Excellence" type="number" value={overrides.yearsExperience ?? ""} onChange={(e) => update({ yearsExperience: Number(e.target.value) })} />
          <Input placeholder="(optional) Other stat" type="text" value={overrides.extraStat ?? ""} onChange={(e) => update({ extraStat: e.target.value })} />
        </div>
      </CardContent></Card>

      <Card className="rounded-[20px] border-white/10 bg-white/5 text-white shadow-2xl"><CardHeader><CardTitle>Logo</CardTitle></CardHeader><CardContent>
        <div className="grid gap-3">
          <Input placeholder="Header logo path (e.g. /images/logo-small.png)" value={overrides.logoImage ?? "/images/logo-small.png"} onChange={(e) => update({ logoImage: e.target.value })} />
          <div className="grid gap-2">
            <label className="text-sm">Upload logo</label>
            <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try { update({ logoImage: await readAdminImage(file) }); } catch (error) { alert(error instanceof Error ? error.message : "Unable to read image."); e.target.value = ""; }
            }} />
            {overrides.logoImage ? <img src={overrides.logoImage} alt="logo preview" className="h-20 w-20 object-contain rounded-md" /> : null}
          </div>
        </div>
      </CardContent></Card>

      <Card className="rounded-[20px] border-white/10 bg-white/5 text-white shadow-2xl">
        <CardHeader><CardTitle>Office & Maps</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <EditableSettingRow
              label="Office Name"
              value={String(overrides.officeName ?? "Shivakripa building")}
              placeholder="Shivakripa building"
              onSave={(nextValue) => update({ officeName: nextValue })}
              helperText="Shown on the Office card and in the footer presence line."
            />
            <EditableSettingRow
              label="Office Address"
              value={String(overrides.officeAddress ?? "APMC ROAD, near City hospital, Puttur, Karnataka 574201")}
              placeholder="APMC ROAD, near City hospital, Puttur, Karnataka 574201"
              onSave={(nextValue) => update({ officeAddress: nextValue })}
              isTextarea
              helperText="Shown as the clickable location text on the homepage."
            />
            <EditableSettingRow
              label="Google Maps URL"
              value={String(overrides.mapsUrl ?? "https://maps.app.goo.gl/eFWv8LbsT6YXw1VH8")}
              placeholder="https://maps.app.goo.gl/..."
              onSave={(nextValue) => update({ mapsUrl: nextValue })}
              helperText="Used for the map pin, office link, and Google review card if no review URL is set."
            />
            <EditableSettingRow label="Owner Phone" value={String(overrides.ownerPhone ?? "+91 97430 42978")} placeholder="+91 97430 42978" onSave={(nextValue) => update({ ownerPhone: nextValue })} />
            <EditableSettingRow label="Office Phone" value={String(overrides.officePhone ?? "+91 82175 85387")} placeholder="+91 82175 85387" onSave={(nextValue) => update({ officePhone: nextValue })} />
            <EditableSettingRow label="WhatsApp Number" value={String(overrides.whatsappNumber ?? "919743042978")} placeholder="919743042978" onSave={(nextValue) => update({ whatsappNumber: nextValue })} />
            <EditableSettingRow label="Instagram URL" value={String(overrides.instagramUrl ?? "https://instagram.com/anugrahaconstruction_")} placeholder="https://instagram.com/..." onSave={(nextValue) => update({ instagramUrl: nextValue })} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-white/10 bg-white/5 text-white shadow-2xl">
        <CardHeader><CardTitle>Google Review</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <EditableSettingRow
              label="Google Review URL"
              value={String(overrides.googleReviewUrl ?? "https://maps.app.goo.gl/eFWv8LbsT6YXw1VH8")}
              placeholder="https://maps.app.goo.gl/..."
              onSave={(nextValue) => update({ googleReviewUrl: nextValue })}
              helperText="Shown on the Google Review CTA and footer review card."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border-white/10 bg-white/5 text-white shadow-2xl"><CardHeader><CardTitle>Company Overview Images</CardTitle></CardHeader><CardContent className="space-y-4">
        <p className="text-sm text-white/60">Upload up to 8 JPG, PNG, or WEBP images. The first five appear in the homepage overview.</p>
        <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={async (event) => { const files = Array.from(event.target.files ?? []); try { const images = await Promise.all(files.map(readAdminImage)); update({ overviewImages: [...(Array.isArray(overrides.overviewImages) ? overrides.overviewImages : []), ...images].slice(0, 8) }); } catch (error) { alert(error instanceof Error ? error.message : "Unable to read overview images."); } event.target.value = ""; }} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{(Array.isArray(overrides.overviewImages) ? overrides.overviewImages : []).map((image: string, index: number) => <div key={`${image.slice(0, 32)}-${index}`} className="overflow-hidden rounded-xl border border-white/10 bg-white/5"><img src={image} alt={`Overview ${index + 1}`} className="h-32 w-full object-cover" /><div className="flex items-center justify-between p-2"><div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => { const next = [...overrides.overviewImages]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; update({ overviewImages: next }); }} className="rounded px-2 py-1 disabled:opacity-30">←</button><button type="button" disabled={index === overrides.overviewImages.length - 1} onClick={() => { const next = [...overrides.overviewImages]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; update({ overviewImages: next }); }} className="rounded px-2 py-1 disabled:opacity-30">→</button></div><label className="cursor-pointer rounded px-2 py-1 text-xs text-primary">Replace<input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const replacement = await readAdminImage(file); const next = [...overrides.overviewImages]; next[index] = replacement; update({ overviewImages: next }); } catch (error) { alert(error instanceof Error ? error.message : "Unable to replace image."); } event.target.value = ""; }} /></label><button type="button" onClick={() => update({ overviewImages: overrides.overviewImages.filter((_: string, itemIndex: number) => itemIndex !== index) })} className="rounded-full bg-rose-600 p-1 text-white"><X className="h-4 w-4" /></button></div></div>)}</div>
      </CardContent></Card>

      <Card className="rounded-[20px] border-white/10 bg-white/5 text-white shadow-2xl"><CardHeader><CardTitle>Gallery</CardTitle></CardHeader><CardContent className="space-y-4">
        <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={async (event) => { const files = Array.from(event.target.files ?? []); try { const images = await Promise.all(files.map(readAdminImage)); update({ galleryImages: [...(Array.isArray(overrides.galleryImages) ? overrides.galleryImages : []), ...images].slice(0, 24) }); } catch (error) { alert(error instanceof Error ? error.message : "Unable to read gallery images."); } event.target.value = ""; }} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{(Array.isArray(overrides.galleryImages) ? overrides.galleryImages : []).map((image: string, index: number) => <div key={`${image.slice(0, 32)}-${index}`} className="relative"><img src={image} alt={`Gallery ${index + 1}`} className="h-28 w-full rounded-xl object-cover" /><button type="button" onClick={() => update({ galleryImages: overrides.galleryImages.filter((_: string, itemIndex: number) => itemIndex !== index) })} className="absolute right-2 top-2 rounded-full bg-rose-600 p-1 text-white"><X className="h-4 w-4" /></button></div>)}</div>
      </CardContent></Card>

      <Card className="rounded-[20px] border-white/10 bg-white/5 text-white shadow-2xl"><CardHeader><CardTitle>FAQs</CardTitle></CardHeader><CardContent>
        <Textarea className="min-h-48" placeholder={"Question | Answer\nOne FAQ per line"} value={(Array.isArray(overrides.faqs) ? overrides.faqs : []).map((faq: { question: string; answer: string }) => `${faq.question} | ${faq.answer}`).join("\n")} onChange={(event) => update({ faqs: event.target.value.split("\n").map((line) => { const [question, ...answer] = line.split("|"); return { question: question.trim(), answer: answer.join("|").trim() }; }).filter((faq) => faq.question && faq.answer) })} />
      </CardContent></Card>

      <Card className="rounded-[20px] border-white/10 bg-white/5 text-white shadow-2xl"><CardHeader><CardTitle>WhatsApp Notifications</CardTitle></CardHeader><CardContent>
        <div className="grid gap-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={Boolean(overrides.whatsappEnabled ?? true)} onChange={(e) => update({ whatsappEnabled: e.target.checked })} />
            <div className="text-sm">Enable WhatsApp notifications for callback requests</div>
          </label>
          <Input placeholder="Owner phone (e.g. +911234567890)" value={overrides.whatsappOwnerNumber ?? ""} onChange={(e) => update({ whatsappOwnerNumber: e.target.value })} />
          <Input placeholder="WhatsApp webhook URL (optional)" value={overrides.whatsappApiUrl ?? ""} onChange={(e) => update({ whatsappApiUrl: e.target.value })} />
          <Input placeholder="WhatsApp API token (optional)" value={overrides.whatsappApiToken ?? ""} onChange={(e) => update({ whatsappApiToken: e.target.value })} />
          <div className="text-xs text-white/55">If blank, server environment variables will be used. Disabling this will stop automatic messages.</div>
        </div>
      </CardContent></Card>

      <div className="flex gap-3">
        <Button onClick={() => { localStorage.setItem("anugraha_site_overrides", JSON.stringify(overrides)); try { window.dispatchEvent(new CustomEvent('anugraha_settings_changed', { detail: overrides })); } catch {} alert("Settings saved locally."); }}>Save Locally</Button>
        <Button onClick={saveToServer} className="bg-primary">Save To Server</Button>
        <Button variant="ghost" onClick={clear}>Clear Overrides</Button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [location] = useLocation();
  const path = location.replace(/\/?$/, "");

  return (
    <Shell>
      {path === "/admin" && <DashboardPage />}
      {path === "/admin/projects" && <ProjectsPage />}
      {path === "/admin/callbacks" && <CallbacksPage />}
      {path === "/admin/team" && <TeamPage />}
      {path === "/admin/services" && <ServicesPage />}
      {path === "/admin/testimonials" && <TestimonialsPage />}
      {path === "/admin/settings" && <SettingsPage />}
    </Shell>
  );
}
