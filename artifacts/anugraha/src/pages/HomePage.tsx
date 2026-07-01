import { useEffect, useMemo, useState, type FormEvent, type SyntheticEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Facebook,
  Instagram,
  Layers3,
  Menu,
  Phone,
  Mail,
  Play,
  Quote,
  Star,
  X,
  MapPin,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  Home,
  Wrench,
  BriefcaseBusiness,
  ClipboardList,
  Users
} from "lucide-react";
import { useLocation } from "wouter";

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
  Textarea,
  Separator,
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui";
import {
  useCreateCallback,
  useFeaturedProjects,
  useOngoingProjects,
  getApiBaseUrl,
  usePublicStats,
  useServices,
  useTestimonials,
  useTeam,
  useSiteSettings
} from "@anugraha/api-client-react";

const imagePlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23e8eef7'/%3E%3Cpath d='M250 390l95-105 70 75 55-55 90 85H250z' fill='%2393a4ba'/%3E%3Ccircle cx='505' cy='215' r='42' fill='%2393a4ba'/%3E%3C/svg%3E";

function withImageFallback(event: SyntheticEvent<HTMLImageElement>) {
  if (event.currentTarget.src !== imagePlaceholder) event.currentTarget.src = imagePlaceholder;
}

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#projects" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" }
];

const serviceIcons = {
  Home,
  Building2,
  BriefcaseBusiness,
  Layers3,
  Wrench,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  Users
};

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const start = window.requestAnimationFrame(() => {
      const startTime = performance.now();
      const duration = 1200;
      const tick = (time: number) => {
        const progress = Math.min((time - startTime) / duration, 1);
        setCurrent(Math.floor(value * progress));
        if (progress < 1) {
          window.requestAnimationFrame(tick);
        }
      };
      window.requestAnimationFrame(tick);
    });
    return () => window.cancelAnimationFrame(start);
  }, [value]);
  return <span>{current.toLocaleString()}{suffix}</span>;
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-3xl">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.34em] text-primary/80">{eyebrow}</p>
      <h2 className="text-4xl font-semibold text-[#071b34] dark:text-white md:text-6xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600 dark:text-white/70 md:text-lg">{subtitle}</p>
    </div>
  );
}

function ProjectRing({ progress }: { progress: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference - (progress / 100) * circumference;
  return (
    <svg viewBox="0 0 72 72" className="h-20 w-20 -rotate-90">
      <circle cx="36" cy="36" r={radius} className="fill-none stroke-white/10" strokeWidth="8" />
      <circle cx="36" cy="36" r={radius} className="fill-none stroke-[#0A66FF] transition-all" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={dash} strokeLinecap="round" />
      <text x="36" y="40" className="rotate-90 fill-white text-[14px] font-bold" textAnchor="middle">{progress}%</text>
    </svg>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof CheckCircle2 }) {
  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-0 text-white shadow-2xl min-h-[96px]">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-2xl font-semibold"><Counter value={value} /></div>
          <div className="text-sm text-white/70">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project, onViewDetails }: { project: { id: number; title: string; description: string; category: string; status: string; progress: number; location: string; imageUrl: string; value: string; phase?: string | null; featured: boolean }; onViewDetails: () => void }) {
  return (
    <motion.div whileHover={{ y: -8 }} className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/80 shadow-[0_10px_40px_rgba(7,27,52,0.12)] backdrop-blur-xl dark:bg-white/5">
      <div className="relative h-64 overflow-hidden">
        <img src={project.imageUrl || imagePlaceholder} onError={withImageFallback} alt={project.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071b34] via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge tone={project.status === "completed" ? "success" : "warning"}>{project.status}</Badge>
          {project.featured ? <Badge className="bg-white/15 text-white">Featured</Badge> : null}
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-white/65">{project.category}</div>
              <h3 className="mt-1 text-2xl font-semibold">{project.title}</h3>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{project.value}</div>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-white/70">{project.description}</p>
        <div className="flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-white/60">
          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{project.location}</span>
          <Button type="button" variant="outline" className="relative z-10 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]" onClick={onViewDetails}>
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ServiceCard({ service }: { service: { id: number; title: string; description: string; icon: string; features: string[] } }) {
  const isImageSource = service.icon.startsWith("data:") || service.icon.startsWith("/images/") || service.icon.startsWith("http://") || service.icon.startsWith("https://");
  const Icon = serviceIcons[service.icon as keyof typeof serviceIcons] ?? Home;
  return (
    <motion.div whileHover={{ y: -8 }} className="glass rounded-[28px] border border-white/10 p-6 text-slate-800 dark:text-white shadow-2xl">
      <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
        {isImageSource ? <img src={service.icon} onError={withImageFallback} alt={service.title} className="h-full w-full object-cover" /> : <Icon className="h-7 w-7 text-slate-800 dark:text-white" />}
      </div>
      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{service.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-white/70">{service.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {service.features.map((feature) => <span key={feature} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-700 dark:text-white/80">{feature}</span>)}
      </div>
    </motion.div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: { clientName: string; clientTitle: string; message: string; rating: number; avatarUrl?: string | null } }) {
  return (
    <div className="glass min-w-[320px] max-w-[360px] rounded-[28px] border border-white/10 p-6 text-white shadow-2xl">
      <Quote className="h-8 w-8 text-white/35" />
      <div className="mt-4 flex items-center gap-3">
        <Avatar className="h-12 w-12 border border-white/10">
          {testimonial.avatarUrl ? <AvatarImage src={testimonial.avatarUrl} alt={testimonial.clientName} /> : <AvatarFallback>{testimonial.clientName.slice(0, 2).toUpperCase()}</AvatarFallback>}
        </Avatar>
        <div>
          <div className="font-semibold">{testimonial.clientName}</div>
          <div className="text-sm text-white/60">{testimonial.clientTitle}</div>
        </div>
      </div>
      <div className="mt-4 flex gap-1 text-amber-300">{Array.from({ length: testimonial.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}</div>
      <p className="mt-4 text-sm leading-6 text-white/75">{testimonial.message}</p>
    </div>
  );
}

function TeamCard({ member }: { member: { name: string; role: string; bio: string; avatarUrl?: string | null; socialLinks?: Record<string, string> } }) {
  return (
    <Card className="group overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-xl dark:bg-white/5">
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={member.avatarUrl || imagePlaceholder} onError={withImageFallback} alt={member.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      </div>
      <CardContent className="p-6">
        <h3 className="text-2xl font-semibold text-[#071b34] dark:text-white">{member.name}</h3>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{member.role}</p>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-white/70">{member.bio}</p>
        {member.socialLinks && Object.keys(member.socialLinks).length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {Object.entries(member.socialLinks).map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold capitalize text-slate-600 transition hover:border-primary hover:text-primary dark:border-white/10 dark:text-white/70">
                {label}
              </a>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectFilter, setProjectFilter] = useState("All");
  const [submitted, setSubmitted] = useState(false);
  const [scrollTop, setScrollTop] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [siteOverrides, setSiteOverrides] = useState<Record<string, unknown>>(() => {
    try {
      return JSON.parse(localStorage.getItem("anugraha_site_overrides") || "{}");
    } catch {
      return {};
    }
  });

  const statsQuery = usePublicStats();
  const featuredQuery = useFeaturedProjects();
  const ongoingQuery = useOngoingProjects();
  const servicesQuery = useServices();
  const testimonialsQuery = useTestimonials();
  const teamQuery = useTeam();
  const callbackMutation = useCreateCallback();

  useEffect(() => {
    const onScroll = () => setScrollTop(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const siteSettingsQuery = useSiteSettings();

  // Keep siteOverrides in sync across tabs when admin saves settings.
  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "anugraha_site_overrides") {
        try {
          const parsed = JSON.parse(ev.newValue || "{}");
          setSiteOverrides(parsed);
        } catch {
          setSiteOverrides({});
        }
      }
    };

    // When tab becomes visible, re-fetch settings from server in case storage event wasn't fired
    const onVisible = async () => {
      if (document.visibilityState === "visible") {
        try {
          const response = await fetch(`${getApiBaseUrl()}/api/settings`);
          if (response.ok) {
            const data = await response.json();
            setSiteOverrides(data ?? {});
            localStorage.setItem("anugraha_site_overrides", JSON.stringify(data ?? {}));
          }
        } catch {
          /* ignore */
        }
      }
    };

    const onCustom = (ev: any) => {
      try {
        if (ev && ev.detail) setSiteOverrides(ev.detail);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener('anugraha_settings_changed', onCustom as EventListener);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener('anugraha_settings_changed', onCustom as EventListener);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const projects = featuredQuery.data ?? [];
    return projectFilter === "All" ? projects : projects.filter((project) => project.category === projectFilter || project.status === projectFilter.toLowerCase());
  }, [featuredQuery.data, projectFilter]);

  const settingsFromQuery = (siteSettingsQuery.data ?? {}) as Record<string, unknown>;
  const effectiveSettings = { ...(siteOverrides as Record<string, unknown>), ...settingsFromQuery } as Record<string, unknown>;

  // hero stat numbers (allow admin overrides)
  const completedOverride = typeof effectiveSettings.completedProjects === "number" ? effectiveSettings.completedProjects : statsQuery.data?.completedProjects ?? 0;
  const happyClientsOverride = typeof effectiveSettings.happyClients === "number" ? effectiveSettings.happyClients : statsQuery.data?.happyClients ?? 0;
  const yearsExpOverride = typeof effectiveSettings.yearsExperience === "number" ? effectiveSettings.yearsExperience : statsQuery.data?.yearsExperience ?? 0;

  const heroCards = [
    { label: "Completed Projects", value: completedOverride, icon: CheckCircle2 },
    { label: "Happy Clients", value: happyClientsOverride, icon: Users },
    { label: "Years of Excellence", value: yearsExpOverride, icon: Clock3 }
  ];

  const heroHeadline = typeof effectiveSettings.heroHeadline === "string" ? effectiveSettings.heroHeadline : "WE CONVERT DREAMS INTO REALITY";
  const heroSubtitle = typeof effectiveSettings.heroSubtitle === "string" ? effectiveSettings.heroSubtitle : "Premium Construction Solutions Powered By Smart Technology";
  // Prefer the uploaded hero image if present; try hero-bg.jpeg first (your WhatsApp file),
  // then fall back to imggggg.png and hero-bg.png for safety.
  const [heroImageSrc, setHeroImageSrc] = useState<string>(
    typeof effectiveSettings.heroImage === "string" ? effectiveSettings.heroImage : "/images/hero-bg.jpeg"
  );
  useEffect(() => {
    setHeroImageSrc(typeof effectiveSettings.heroImage === "string" && effectiveSettings.heroImage
      ? effectiveSettings.heroImage
      : "/images/hero-bg.jpeg");
  }, [effectiveSettings.heroImage]);
  const logoImage = typeof effectiveSettings.logoImage === "string" ? effectiveSettings.logoImage : "/images/logo-small.png";

  // Office & map overrides (editable from Admin Settings)
  const mapsUrl = typeof effectiveSettings.mapsUrl === "string" ? effectiveSettings.mapsUrl : "https://maps.app.goo.gl/eFWv8LbsT6YXw1VH8";
  const officeName = typeof effectiveSettings.officeName === "string" ? effectiveSettings.officeName : "Shivakripa building";
  const officeAddress = typeof effectiveSettings.officeAddress === "string" ? effectiveSettings.officeAddress : "APMC ROAD, near City hospital, Puttur, Karnataka 574201";
  const ownerPhone = typeof effectiveSettings.ownerPhone === "string" ? effectiveSettings.ownerPhone : "+91 97430 42978";
  const officePhone = typeof effectiveSettings.officePhone === "string" ? effectiveSettings.officePhone : "+91 82175 85387";
  const whatsappNumber = typeof effectiveSettings.whatsappNumber === "string" ? effectiveSettings.whatsappNumber.replace(/\D/g, "") : "919743042978";
  const instagramUrl = typeof effectiveSettings.instagramUrl === "string" ? effectiveSettings.instagramUrl : "https://instagram.com/anugrahaconstruction_";
  const googleReviewUrl = typeof effectiveSettings.googleReviewUrl === "string" ? effectiveSettings.googleReviewUrl : mapsUrl;
  const googleReviewSubtitle = typeof effectiveSettings.googleReviewSubtitle === "string" ? effectiveSettings.googleReviewSubtitle : "Anugraha Constructions, Puttur, APMC Road";
  // Company overview images removed per request
  // const overviewImages = ...

  const galleryImages = Array.isArray(effectiveSettings.galleryImages) ? effectiveSettings.galleryImages.filter((image): image is string => typeof image === "string") : [];
  const faqs = Array.isArray(effectiveSettings.faqs) ? effectiveSettings.faqs.filter((faq): faq is { question: string; answer: string } => Boolean(faq && typeof faq === "object" && typeof (faq as { question?: unknown }).question === "string" && typeof (faq as { answer?: unknown }).answer === "string")) : [];

  const categories = ["All", "Residential", "Commercial", "ongoing", "completed"];

  const submitCallback = async (event: FormEvent) => {
    event.preventDefault();
    await callbackMutation.mutateAsync(form);
    setSubmitted(true);
    setForm({ name: "", phone: "", email: "", message: "" });
  };

  return (
    <div id="home" className="relative min-h-screen overflow-hidden bg-transparent text-[#071b34] dark:text-white">
      <header className={scrollTop ? "fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-white/80 backdrop-blur-xl dark:bg-[#071b34]/90" : "fixed inset-x-0 top-0 z-40 bg-transparent"}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <img src={logoImage} onError={withImageFallback} alt="Anugraha logo" className="h-10 w-10 rounded-full object-cover shadow-glow" />
            <div>
              <div className="text-lg font-semibold tracking-[0.26em]">ANUGRAHA</div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-white/60">Constructions</div>
            </div>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => <a key={link.label} href={link.href} className="text-sm font-medium text-slate-600 transition hover:text-primary dark:text-white/70">{link.label}</a>)}
            <a href={`tel:${ownerPhone}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow">
              <Phone className="h-4 w-4" /> Call Us
            </a>
          </nav>
          <button className="md:hidden" onClick={() => setMenuOpen((value) => !value)}><Menu /></button>
        </div>
        <AnimatePresence>
          {menuOpen ? (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="md:hidden glass border-t border-white/10 px-4 py-4 text-white">
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-2xl px-3 py-2 hover:bg-white/10">{link.label}</a>)}
                <a href={`tel:${ownerPhone}`} className="rounded-2xl bg-white/10 px-3 py-2">Call Us</a>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <section className="relative isolate min-h-screen overflow-hidden bg-transparent pt-24 text-white">
        {/* Full-hero background (behind headline) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Use CSS background to avoid inherited filters; keeps image visible */}
            <img
              src={heroImageSrc}
              alt="Anugraha hero background"
              className="absolute inset-0 h-full w-full object-cover z-0"
              style={{ objectPosition: "center", filter: "none" }}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement & { dataset: any };
                // fallback chain: try imggggg.png, hero-bg.png, then hero-bg.jpg
                if (!img.dataset.fallback) {
                  img.dataset.fallback = '1';
                  img.src = '/images/imggggg.png';
                  return;
                }
                if (img.dataset.fallback === '1') {
                  img.dataset.fallback = '2';
                  img.src = '/images/hero-bg.png';
                  return;
                }
                if (img.dataset.fallback === '2') {
                  img.dataset.fallback = '3';
                  img.src = '/images/hero-bg.jpg';
                  return;
                }
              }}
            />
        </div>
        {/* Dark overlay to improve contrast for hero text */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(90deg, rgba(7,27,52,0.72) 0%, rgba(7,27,52,0.38) 55%, rgba(7,27,52,0.18) 100%)",
            pointerEvents: 'none'
          }}
        />
        <div className="relative z-20 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="max-w-3xl">
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#071b34]/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white">
              <Sparkles className="h-4 w-4" /> Luxury Construction & Real Estate
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="max-w-full text-4xl md:text-5xl lg:text-5xl xl:text-[3.5rem] font-black uppercase leading-[0.95] tracking-tight whitespace-normal text-white drop-shadow-2xl"
              style={{ textShadow: '0 6px 28px rgba(2,8,23,0.7)' }}
            >
              {heroHeadline}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-6 max-w-2xl text-lg leading-8 text-white md:text-xl drop-shadow-lg" style={{ textShadow: '0 4px 20px rgba(2,8,23,0.55)' }}>
              {heroSubtitle}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mt-10 flex flex-wrap gap-4">
              <a href="#projects" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15"><ArrowRight className="h-4 w-4" />Explore Projects</a>
              <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15"><Play className="h-4 w-4" />Book Consultation</a>
              <a href="#ongoing" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/80 backdrop-blur-xl transition hover:bg-white/10"><Layers3 className="h-4 w-4" />View Ongoing Projects</a>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-14 flex items-center gap-3 text-sm text-white/65">
              <ChevronDown className="h-4 w-4 animate-bounce" /> Scroll for details
            </motion.div>
          </div>

          <div className="relative lg:pl-10">
            <div className="flex flex-col items-end gap-4">
              {heroCards.map((card, index) => (
                <div key={card.label} className="w-56">
                  <StatCard label={card.label} value={card.value} icon={card.icon} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="overflow-x-hidden relative z-10 -mt-10 rounded-t-[2rem] bg-[#f7faff] pb-0 dark:bg-[#071b34]">
        <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-1 lg:items-end">
            <div>

              <SectionTitle eyebrow={typeof effectiveSettings.overviewBadge === "string" ? effectiveSettings.overviewBadge : "Company Overview"} title={typeof effectiveSettings.overviewTitle === "string" ? effectiveSettings.overviewTitle : "Measured delivery. Elevated living."} subtitle={typeof effectiveSettings.overviewDescription === "string" ? effectiveSettings.overviewDescription : "A concise view of scale, trust, and delivery discipline across premium residential and commercial assets."} />
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { label: "Projects", value: typeof effectiveSettings.totalProjects === "number" ? effectiveSettings.totalProjects : statsQuery.data?.totalProjects ?? 0 },
                  { label: "Years", value: typeof effectiveSettings.yearsExperience === "number" ? effectiveSettings.yearsExperience : statsQuery.data?.yearsExperience ?? 0 },
                  { label: "Clients", value: typeof effectiveSettings.happyClients === "number" ? effectiveSettings.happyClients : statsQuery.data?.happyClients ?? 0 },
                  { label: "Team", value: typeof effectiveSettings.teamSize === "number" ? effectiveSettings.teamSize : statsQuery.data?.teamSize ?? 0 }
                ].map((stat) => <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"><div className="text-3xl font-semibold text-[#071b34] dark:text-white">{statsQuery.isLoading ? "—" : <Counter value={stat.value} />}</div><div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{stat.label}</div></div>)}
              </div>
            </div>
            {/* Company overview images removed per request. Keep only projects/years/clients/team stats. */}

          </div>
        </section>


        <section id="projects" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <SectionTitle eyebrow="Project Showcase" title="Featured projects that anchor our reputation." subtitle="A curated set of premium developments across residential and commercial categories, selected to represent the brand on the homepage." />
          <div className="mt-8 flex flex-wrap gap-3">
            {categories.map((category) => <button key={category} onClick={() => setProjectFilter(category)} className={projectFilter === category ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow" : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70"}>{category}</button>)}
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredQuery.isLoading ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-[460px] rounded-[28px]" />) : filteredProjects.map((project) => <ProjectCard key={project.id} project={project as any} onViewDetails={() => navigate(`/projects/${project.id}`)} />)}
          </div>
        </section>

        <section id="ongoing" className="bg-[#071b34] px-4 py-20 text-white">
          <div className="mx-auto max-w-7xl lg:px-4">
            <SectionTitle eyebrow="Ongoing Tracker" title="Construction progress shown with clarity." subtitle="Live status snapshots for projects currently under delivery, with progress bars and circular indicators." />
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {ongoingQuery.isLoading ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-[360px] rounded-[28px] bg-white/10" />) : ongoingQuery.data?.map((project) => (
                <Card key={project.id} className="glass overflow-hidden rounded-[28px] border-white/10 text-white shadow-2xl">
                  <img src={project.imageUrl || imagePlaceholder} onError={withImageFallback} alt={project.title} className="h-56 w-full object-cover" />
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-semibold">{project.title}</h3>
                        <p className="mt-1 text-sm text-white/65"><MapPin className="mr-2 inline h-4 w-4" />{project.location}</p>
                      </div>
                      <ProjectRing progress={project.progress} />
                    </div>
                    <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{project.phase ?? "Execution"}</div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-white/65"><span>Project progress</span><span>{project.progress}%</span></div>
                      <div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} /></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <SectionTitle eyebrow="Services" title="A luxury delivery stack under one roof." subtitle="Architecture, construction, interiors, and management services shaped for premium developments." />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {servicesQuery.isLoading ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-72 rounded-[28px]" />) : servicesQuery.isError ? <p className="text-rose-600 md:col-span-2 xl:col-span-3">Services could not be loaded. Please try again shortly.</p> : servicesQuery.data?.length ? servicesQuery.data.map((service) => <ServiceCard key={service.id} service={service as any} />) : <p className="text-slate-500 md:col-span-2 xl:col-span-3">No services have been published yet.</p>}
          </div>
        </section>

        <section id="team" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <SectionTitle eyebrow="Our Team" title="The people behind every successful build." subtitle="Meet the professionals responsible for planning, execution, quality, and client service." />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {teamQuery.isLoading ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-[420px] rounded-[28px]" />) : teamQuery.isError ? <p className="text-rose-600 sm:col-span-2 xl:col-span-3">Team members could not be loaded. Please try again shortly.</p> : teamQuery.data?.length ? teamQuery.data.map((member) => <TeamCard key={member.id} member={member} />) : <p className="text-slate-500 sm:col-span-2 xl:col-span-3">Team profiles will be published soon.</p>}
          </div>
        </section>

        {galleryImages.length ? <section id="gallery" className="bg-slate-100 px-4 py-20 dark:bg-white/5">
          <div className="mx-auto max-w-7xl lg:px-4">
            <SectionTitle eyebrow="Gallery" title="A closer look at our work." subtitle="Recent construction, detailing, and finished-space highlights managed from the owner dashboard." />
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {galleryImages.map((image, index) => <img key={`${image}-${index}`} src={image} onError={withImageFallback} alt={`Anugraha construction gallery ${index + 1}`} loading="lazy" className="h-52 w-full rounded-[24px] object-cover shadow-lg md:h-72" />)}
            </div>
          </div>
        </section> : null}

        <section className="bg-[#071b34] px-4 py-20 text-white">
          <div className="mx-auto max-w-7xl lg:px-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <SectionTitle eyebrow="Google Reviews" title="Reviews from our Google profile." subtitle="Featured client voices from luxury homes, commercial campuses, and premium redevelopment work." />
              <a href={googleReviewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/15 hover:text-white">
                <Star className="h-4 w-4 fill-current" />
                Leave a Google Review
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-10 overflow-hidden">
              <div className={testimonialsQuery.data && testimonialsQuery.data.length > 1 ? "marquee-track flex w-max gap-5 pb-2" : "flex gap-5 pb-2"}>
                {testimonialsQuery.isLoading ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-64 w-[360px] rounded-[28px] bg-white/10" />) : testimonialsQuery.isError ? <p className="text-rose-300">Testimonials could not be loaded. Please try again shortly.</p> : testimonialsQuery.data?.length ? [...testimonialsQuery.data, ...(testimonialsQuery.data.length > 1 ? testimonialsQuery.data : [])].map((testimonial, index) => <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial as any} />) : <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-white/65">No testimonials have been published yet.</div>}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-gradient-to-b from-slate-100 to-blue-50 py-16">
          <div className="container mx-auto flex flex-col items-center justify-center px-6 lg:px-10">
            <SectionTitle eyebrow="Contact" title="Book a consultation with the owner team." subtitle="Send a callback inquiry and we’ll respond with the right technical and commercial next step." />
            <Card className="mt-10 w-full rounded-3xl border border-slate-200 bg-white/90 shadow-2xl backdrop-blur-xl">
              <CardContent className="p-6 md:p-10">
                <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-4">
                  <div className="w-full max-w-5xl space-y-2 text-center">
                    <h3 className="text-3xl font-semibold text-[#071b34] md:text-4xl">Tell us about your project and we’ll respond quickly</h3>
                    <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-600 md:text-base">Luxury residential, commercial, interiors, and redevelopment inquiries are handled by our owner team directly.</p>
                  </div>

                  <form className="grid w-full max-w-7xl gap-5" onSubmit={submitCallback}>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name *" required className="w-full rounded-2xl border border-slate-300 bg-[#ffffff] px-5 py-4 text-[#071b34] outline-none transition-all placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                      <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone *" required className="w-full rounded-2xl border border-slate-300 bg-[#ffffff] px-5 py-4 text-[#071b34] outline-none transition-all placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                      <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" type="email" className="w-full rounded-2xl border border-slate-300 bg-[#ffffff] px-5 py-4 text-[#071b34] outline-none transition-all placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <Textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Tell us about your project requirements" className="min-h-[170px] w-full rounded-2xl border border-slate-300 bg-[#ffffff] px-5 py-4 text-[#071b34] outline-none transition-all placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button type="submit" className="h-14 w-full gap-2 rounded-2xl bg-blue-600 px-6 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700" disabled={callbackMutation.isPending}>
                        <ArrowRight className="h-4 w-4" />
                        {callbackMutation.isPending ? "Submitting..." : "Request Callback"}
                      </Button>
                      <a href="https://maps.app.goo.gl/DwgTLeeBMbqcQ1Ju6" target="_blank" rel="noopener noreferrer" className="inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 text-base font-semibold text-[#071b34] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-slate-400 hover:bg-slate-50">
                        <Star className="h-4 w-4 text-amber-500" /> Review on Google
                      </a>
                    </div>

                    {/* Statistic cards removed per request */}

                    {submitted ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">Thank you. Our team will reach out soon.</div> : null}
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {faqs.length ? <section id="faqs" className="mx-auto max-w-5xl px-4 py-20 lg:px-8">
          <SectionTitle eyebrow="FAQs" title="Clear answers before construction begins." subtitle="Common questions about our process, delivery, and project engagement." />
          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => <details key={`${faq.question}-${index}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"><summary className="cursor-pointer list-none font-semibold text-[#071b34] dark:text-white">{faq.question}<ChevronDown className="float-right h-5 w-5 transition group-open:rotate-180" /></summary><p className="mt-4 leading-7 text-slate-600 dark:text-white/70">{faq.answer}</p></details>)}
          </div>
        </section> : null}
      </main>

      <footer className="bg-[#071b34] px-4 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 border-t border-white/10 pt-10 md:grid-cols-2 lg:grid-cols-4 lg:px-4">
          <div>
            <div className="text-2xl font-semibold">Anugraha Constructions</div>
            <p className="mt-3 text-sm leading-6 text-white/65">Luxury construction and real-estate experiences with a disciplined execution model and premium finish standards.</p>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white/55">Quick Links</div>
            <div className="mt-4 grid gap-3 text-sm text-white/75">
              {navLinks.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white/55">Contact</div>
            <div className="mt-4 grid gap-2 text-sm text-white/75">
              <a href={`tel:${ownerPhone}`}>{ownerPhone}</a>
              <a href={`tel:${officePhone}`}>{officePhone}</a>
              <a href={instagramUrl}>Instagram</a>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white/55">Presence</div>
            <p className="mt-4 text-sm leading-6 text-white/75">{officeName}, {officeAddress}</p>
            {/* Google review card removed per request */}
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-sm text-white/55 lg:px-4">© 2026 Anugraha Constructions. All rights reserved.</div>
      </footer>

      <a href={`https://wa.me/${whatsappNumber}`} className="whatsapp-float fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-emerald-600/30"><MessageCircle className="h-7 w-7" /></a>
    </div>
  );
}
