import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, ChevronRight, CircleCheckBig, Clock3, ExternalLink, MapPin, Phone, Sparkles, Star, Wrench } from "lucide-react";
import { Link, useLocation } from "wouter";

import { Button, Card, CardContent, CardTitle, Badge, Skeleton, Separator } from "@/components/ui";
import { useFeaturedProjects, useProject, useProjects } from "@anugraha/api-client-react";

const ownerPhone = "919743042978";

function formatDate(value?: string | null) {
  if (!value) return "TBD";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

function buildWhatsAppUrl(projectTitle: string, projectLocation: string) {
  const message = [
    "Hello ANUGRAHA CONSTRUCTIONS,",
    `I am interested in the project: ${projectTitle}.`,
    `Location: ${projectLocation}.`,
    "Please share more details."
  ].join("\n");
  return `https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`;
}

function ProjectTile({
  title,
  imageUrl,
  category,
  onOpen
}: {
  title: string;
  imageUrl: string;
  category: string;
  onOpen: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      onClick={onOpen}
      className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/5 text-left text-white shadow-2xl"
    >
      <div className="relative h-44 overflow-hidden">
        <img src={imageUrl} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071b34] via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur-md">
          {category}
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="text-lg font-semibold">{title}</div>
        <div className="inline-flex items-center gap-2 text-sm text-white/70">
          View details <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </motion.button>
  );
}

export default function ProjectDetailsPage() {
  const [location, navigate] = useLocation();
  const projectId = Number(location.split("/")[2]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const projectQuery = useProject(Number.isFinite(projectId) ? projectId : undefined);
  const allProjectsQuery = useProjects();
  const featuredQuery = useFeaturedProjects();

  const project = projectQuery.data;
  const galleryImages = useMemo(() => {
    const images = project?.galleryImages?.length ? project.galleryImages : project?.images ?? [];
    return images.length ? images : project ? [project.imageUrl] : [];
  }, [project]);

  const relatedProjects = useMemo(() => {
    const all = allProjectsQuery.data ?? [];
    if (!project) return [];
    const sameCategory = all.filter((item) => item.id !== project.id && item.category === project.category);
    const featured = (featuredQuery.data ?? []).filter((item) => item.id !== project.id && item.category !== project.category);
    return [...sameCategory, ...featured].slice(0, 4);
  }, [allProjectsQuery.data, featuredQuery.data, project]);

  const whatsappUrl = project ? buildWhatsAppUrl(project.title, project.location) : "https://wa.me/919743042978";

  if (!Number.isFinite(projectId)) {
    return (
      <div className="min-h-screen bg-[#071b34] px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="text-sm uppercase tracking-[0.28em] text-white/55">Project details</div>
          <h1 className="mt-4 text-4xl font-semibold">Invalid project link</h1>
          <p className="mt-3 text-white/70">The project identifier in the URL is not valid.</p>
          <Button className="mt-8" onClick={() => navigate("/")}>Back to homepage</Button>
        </div>
      </div>
    );
  }

  if (projectQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#071b34] px-4 py-8 text-white">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-[420px] rounded-[32px] bg-white/10" />
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <Skeleton className="h-[420px] rounded-[32px] bg-white/10" />
            <Skeleton className="h-[420px] rounded-[32px] bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (projectQuery.isError || !project) {
    return (
      <div className="min-h-screen bg-[#071b34] px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-sm uppercase tracking-[0.28em] text-white/55">Project details</div>
          <h1 className="mt-4 text-4xl font-semibold">Project not found</h1>
          <p className="mt-3 text-white/70">We could not load this project. It may have been removed or the link is invalid.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => navigate("/")}>Back to homepage</Button>
            <Button variant="outline" onClick={() => navigate("/admin/projects")}>Open admin projects</Button>
          </div>
        </div>
      </div>
    );
  }

  const activeImage = galleryImages[activeImageIndex] ?? project.imageUrl;
  const projectFeatures = project.features?.length ? project.features : project.amenities ?? [];
  const projectAmenities = project.amenities?.length ? project.amenities : project.features ?? [];

  return (
    <div className="min-h-screen bg-[#071b34] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img src={activeImage} alt={project.title} className="h-full w-full object-cover opacity-35 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071b34] via-[#071b34]/88 to-[#071b34]/50" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" /> Back to homepage
            </Link>
            <Badge className="bg-white/10 text-white">Project ID #{project.id}</Badge>
            <Badge tone={project.status === "completed" ? "success" : "warning"}>{project.status}</Badge>
          </div>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white/80">
                <Sparkles className="h-4 w-4" /> {project.category}
              </div>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-5xl xl:text-6xl">{project.title}</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 md:text-lg">{project.description}</p>
            </div>
            <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-3 text-sm text-white/75">
                <div>
                  <div className="text-white/45">Location</div>
                  <div className="mt-1 font-medium text-white">{project.location}</div>
                </div>
                <div>
                  <div className="text-white/45">Value</div>
                  <div className="mt-1 font-medium text-white">{project.value}</div>
                </div>
                <div>
                  <div className="text-white/45">Progress</div>
                  <div className="mt-1 font-medium text-white">{project.progress}%</div>
                </div>
                <div>
                  <div className="text-white/45">Phase</div>
                  <div className="mt-1 font-medium text-white">{project.phase ?? "Execution"}</div>
                </div>
              </div>
              <Separator className="border-white/10" />
              <div className="grid gap-3 sm:grid-cols-2">
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                  Enquire on WhatsApp
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a href={`tel:${ownerPhone}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  <Phone className="h-4 w-4" /> Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden rounded-[32px] border-white/10 bg-white/5 text-white shadow-2xl">
            <CardContent className="p-4 md:p-6">
              <motion.div layoutId={`project-image-${project.id}`} className="relative overflow-hidden rounded-[28px]">
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt={project.title}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="h-[340px] w-full object-cover md:h-[520px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071b34]/45 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-md">Hero image</div>
              </motion.div>

              <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`group overflow-hidden rounded-[20px] border transition ${index === activeImageIndex ? "border-primary ring-2 ring-primary/40" : "border-white/10 opacity-75 hover:opacity-100"}`}
                  >
                    <img src={image} alt={`${project.title} gallery ${index + 1}`} className="h-24 w-full object-cover transition duration-700 group-hover:scale-110" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/10 bg-white/5 text-white shadow-2xl">
              <CardContent className="space-y-5 p-6">
                <CardTitle className="text-2xl">Project information</CardTitle>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoBlock label="Category" value={project.category} />
                  <InfoBlock label="Status" value={project.status} />
                  <InfoBlock label="Location" value={project.location} icon={<MapPin className="h-4 w-4" />} />
                  <InfoBlock label="Value" value={project.value} icon={<Star className="h-4 w-4" />} />
                  <InfoBlock label="Start date" value={formatDate(project.startDate)} icon={<CalendarDays className="h-4 w-4" />} />
                  <InfoBlock label="Completion" value={formatDate(project.endDate)} icon={<Clock3 className="h-4 w-4" />} />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-white/65">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-white/10 bg-white/5 text-white shadow-2xl">
              <CardContent className="space-y-5 p-6">
                <CardTitle className="text-2xl">Features</CardTitle>
                <div className="flex flex-wrap gap-3">
                  {projectFeatures.map((feature) => (
                    <span key={feature} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                      <CircleCheckBig className="h-4 w-4 text-emerald-300" />
                      {feature}
                    </span>
                  ))}
                </div>
                <Separator className="border-white/10" />
                <CardTitle className="text-2xl">Amenities</CardTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  {projectAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                      <Wrench className="h-4 w-4 text-primary" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[32px] border-white/10 bg-white/5 text-white shadow-2xl">
            <CardContent className="space-y-5 p-6">
              <CardTitle className="text-2xl">Timeline</CardTitle>
              <div className="space-y-4">
                <TimelineRow title="Project started" value={formatDate(project.startDate)} />
                <TimelineRow title="Current phase" value={project.phase ?? "Execution"} />
                <TimelineRow title="Expected completion" value={formatDate(project.endDate)} />
                <TimelineRow title="Live status" value={`${project.progress}% complete`} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/10 bg-white/5 text-white shadow-2xl">
            <CardContent className="space-y-5 p-6">
              <CardTitle className="text-2xl">Project summary</CardTitle>
              <p className="text-sm leading-7 text-white/72">
                {project.description}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                  Enquire on WhatsApp
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a href={`tel:${ownerPhone}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  <Phone className="h-4 w-4" /> Call Now
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-white/55">Related projects</div>
              <h2 className="mt-2 text-3xl font-semibold">Similar and featured developments</h2>
            </div>
            <Link href="/" className="hidden text-sm text-white/70 transition hover:text-white md:inline-flex">
              Back home
            </Link>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {relatedProjects.length ? relatedProjects.map((related) => (
              <ProjectTile
                key={related.id}
                id={related.id}
                title={related.title}
                imageUrl={related.imageUrl}
                category={related.category}
                onOpen={() => {
                  setActiveImageIndex(0);
                  navigate(`/projects/${related.id}`);
                }}
              />
            )) : (
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-white/70 md:col-span-2 xl:col-span-4">No related projects found yet.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoBlock({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-white">{value}</div>
    </div>
  );
}

function TimelineRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm">
      <span className="text-white/55">{title}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
