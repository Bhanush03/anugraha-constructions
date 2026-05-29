import { and, count, desc, eq, sql } from "drizzle-orm";

import { callbacks, projects, services, team, testimonials, siteSettings } from "../../../lib/db/src/index.js";

import { db } from "./db.js";
import { env } from "./env.js";
import crypto from "crypto";

const projectSeed = [
  {
    slug: "prestige-skyline-tower",
    title: "Prestige Skyline Tower",
    description: "A sculpted residential landmark with sky lounges, refined amenities, and precision-built luxury residences.",
    status: "completed",
    category: "Residential",
    progress: 100,
    location: "Bengaluru",
    value: "₹180 Cr",
    startDate: "2021-04-01",
    endDate: "2024-02-28",
    imageUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80"
    ],
    features: ["Sky lounges", "Premium lifts", "Clubhouse", "Panoramic decks"],
    amenities: ["Gymnasium", "Pool deck", "24x7 security", "Landscape terrace"],
    featured: true,
    phase: "Delivered"
  },
  {
    slug: "anugraha-corporate-hub",
    title: "Anugraha Corporate Hub",
    description: "A premium commercial office campus tailored for leadership teams and next-generation workspace experiences.",
    status: "completed",
    category: "Commercial",
    progress: 100,
    location: "Electronic City, Bengaluru",
    value: "₹220 Cr",
    startDate: "2020-09-01",
    endDate: "2023-11-30",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80"
    ],
    features: ["Executive floors", "Conference suites", "Grand lobby", "Smart access"],
    amenities: ["Cafeteria", "Visitor parking", "Security control", "High-speed lifts"],
    featured: true,
    phase: "Delivered"
  },
  {
    slug: "serene-villa-estates",
    title: "Serene Villa Estates",
    description: "A low-density luxury villa community with tranquil planning, premium finishes, and landscaped privacy.",
    status: "ongoing",
    category: "Residential",
    progress: 68,
    location: "Whitefield, Bengaluru",
    value: "₹340 Cr",
    startDate: "2024-02-01",
    endDate: null,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80",
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80"
    ],
    features: ["Private gardens", "Double-height living", "Indoor-outdoor flow", "Spa-inspired design"],
    amenities: ["Clubhouse", "Kids zone", "Jogging track", "Zen court"],
    featured: true,
    phase: "Interior & Finishing"
  },
  {
    slug: "metro-mall-expansion",
    title: "Metro Mall Expansion",
    description: "A large-format retail expansion focused on circulation, structural clarity, and premium shopper experiences.",
    status: "ongoing",
    category: "Commercial",
    progress: 45,
    location: "Koramangala, Bengaluru",
    value: "₹95 Cr",
    startDate: "2024-06-15",
    endDate: null,
    imageUrl: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1200&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80"
    ],
    features: ["Retail atrium", "Circulation planning", "Facade upgrade", "Signage zones"],
    amenities: ["Food court", "Escalator core", "Parking decks", "Event plaza"],
    featured: false,
    phase: "Structural Work"
  },
  {
    slug: "riverside-residency",
    title: "Riverside Residency",
    description: "A premium residential enclave with water-view planning, climate-conscious materials, and careful detailing.",
    status: "ongoing",
    category: "Residential",
    progress: 82,
    location: "Mysuru, Karnataka",
    value: "₹65 Cr",
    startDate: "2023-11-01",
    endDate: null,
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1200&q=80"
    ],
    features: ["Water-view decks", "Climate conscious materials", "Refined detailing", "Private entries"],
    amenities: ["Pool", "Meditation lawn", "Visitor bays", "Club lounge"],
    featured: true,
    phase: "Roofing & MEP"
  },
  {
    slug: "techpark-phase-iii",
    title: "TechPark Phase III",
    description: "A precision-built tech campus extension delivering resilient structures and efficient delivery sequencing.",
    status: "completed",
    category: "Commercial",
    progress: 100,
    location: "Hebbal, Bengaluru",
    value: "₹150 Cr",
    startDate: "2021-07-01",
    endDate: "2024-01-31",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80"
    ],
    features: ["Scalable structure", "Efficient delivery", "High service core", "Flexible planning"],
    amenities: ["Business lounge", "Loading bays", "Server rooms", "Cafeteria"],
    featured: false,
    phase: "Delivered"
  }
] as const;

const serviceSeed = [
  {
    title: "Residential Construction",
    description: "Luxury homes, villas, and apartment projects built with elite detailing and disciplined execution.",
    icon: "Home",
    features: ["Luxury villas", "Smart homes", "Premium finishes", "On-time delivery"],
    order: 1
  },
  {
    title: "Commercial Development",
    description: "Corporate towers, retail expansions, and business campuses designed for scale and prestige.",
    icon: "Building2",
    features: ["Office parks", "Retail shells", "Mixed use", "Value engineering"],
    order: 2
  },
  {
    title: "Interior Design",
    description: "Elegant interiors shaped around material richness, spatial clarity, and brand identity.",
    icon: "Palette",
    features: ["Turnkey fit-outs", "Bespoke joinery", "Material curation", "Lighting design"],
    order: 3
  },
  {
    title: "Project Management",
    description: "High-trust planning, milestone control, and reporting for complex builds.",
    icon: "ClipboardCheck",
    features: ["Vendor control", "Timeline governance", "Budget tracking", "Quality audits"],
    order: 4
  },
  {
    title: "Architecture & Planning",
    description: "Concept-to-construction architecture with a premium, context-aware design lens.",
    icon: "DraftingCompass",
    features: ["Concept plans", "Approvals", "3D visualization", "Structural alignment"],
    order: 5
  },
  {
    title: "Renovation & Restoration",
    description: "High-end upgrades and restorations for legacy homes and commercial assets.",
    icon: "Wrench",
    features: ["Selective retrofits", "Facade refresh", "MEP modernization", "Interior upgrade"],
    order: 6
  }
] as const;

const testimonialSeed = [
  {
    clientName: "Arjun Rao",
    clientTitle: "Director, Southline Group",
    message: "Anugraha delivered a remarkably polished execution standard. Every site review felt organized, transparent, and premium.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    featured: true
  },
  {
    clientName: "Meera Nair",
    clientTitle: "Villa Owner",
    message: "The team translated our design intent into a home that feels calm, expensive, and impeccably finished.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    featured: true
  },
  {
    clientName: "Karthik Shetty",
    clientTitle: "Facilities Head, Tech Campus",
    message: "Their project management and communication discipline were standout. The experience felt enterprise-grade.",
    rating: 4,
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
    featured: true
  },
  {
    clientName: "Priya Menon",
    clientTitle: "Investments Partner",
    message: "Commercial spaces were handed over with excellent finish quality and consistent schedule reporting.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    featured: true
  },
  {
    clientName: "Rahul Verma",
    clientTitle: "Promoter, Riverside Residency",
    message: "They handled complexity with calm precision and premium execution throughout the build cycle.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    featured: false
  }
] as const;

const teamSeed = [
  {
    name: "Sanjay Kumar",
    role: "Founder & CEO",
    bio: "Vision-led builder focused on premium delivery, operational rigor, and long-term client trust.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
    order: 1
  },
  {
    name: "Ananya Iyer",
    role: "Chief Architect",
    bio: "Leads concept development, spatial storytelling, and the architectural language of every landmark project.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    order: 2
  },
  {
    name: "Vikram Bhat",
    role: "Head of Projects",
    bio: "Ensures disciplined planning, site execution, procurement alignment, and delivery certainty.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80",
    order: 3
  },
  {
    name: "Rhea Kapoor",
    role: "Interior Design Director",
    bio: "Shapes material palettes, lighting, and luxe detail systems for homes and workspaces.",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80",
    order: 4
  }
] as const;

const callbackSeed = [
  { name: "Anil", phone: "+919876543210", email: "anil@example.com", message: "Interested in a luxury villa project.", status: "pending" },
  { name: "Nisha", phone: "+919812345678", email: "nisha@example.com", message: "Need a callback for commercial interiors.", status: "contacted" },
  { name: "Farhan", phone: "+919900112233", email: "farhan@example.com", message: "Discussing a renovation timeline.", status: "resolved" }
] as const;

async function createTables() {
  if (!db) return;
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS projects (
      id integer PRIMARY KEY AUTOINCREMENT,
      slug text NOT NULL DEFAULT '',
      title text NOT NULL,
      description text NOT NULL,
      status text NOT NULL DEFAULT 'ongoing',
      category text NOT NULL,
      progress int NOT NULL DEFAULT 0,
      location text NOT NULL,
      value text NOT NULL,
      start_date text NOT NULL,
      end_date text,
      image_url text NOT NULL,
      images text NOT NULL,
      features text NOT NULL DEFAULT '[]',
      amenities text NOT NULL DEFAULT '[]',
      featured integer NOT NULL DEFAULT 0,
      phase text,
      created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try { await db.run(sql`ALTER TABLE projects ADD COLUMN slug text NOT NULL DEFAULT ''`); } catch {}
  try { await db.run(sql`ALTER TABLE projects ADD COLUMN features text NOT NULL DEFAULT '[]'`); } catch {}
  try { await db.run(sql`ALTER TABLE projects ADD COLUMN amenities text NOT NULL DEFAULT '[]'`); } catch {}

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS services (
      id integer PRIMARY KEY AUTOINCREMENT,
      title text NOT NULL,
      description text NOT NULL,
      icon text NOT NULL,
      features text NOT NULL,
      \`order\` int NOT NULL DEFAULT 0,
      created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id integer PRIMARY KEY AUTOINCREMENT,
      client_name text NOT NULL,
      client_title text NOT NULL,
      message text NOT NULL,
      rating int NOT NULL DEFAULT 5,
      avatar_url text,
      featured integer NOT NULL DEFAULT 0,
      created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS callbacks (
      id integer PRIMARY KEY AUTOINCREMENT,
      name text NOT NULL,
      phone text NOT NULL,
      email text,
      message text,
      status text NOT NULL DEFAULT 'pending',
      created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS team (
      id integer PRIMARY KEY AUTOINCREMENT,
      name text NOT NULL,
      role text NOT NULL,
      bio text NOT NULL,
      avatar_url text,
      \`order\` int NOT NULL DEFAULT 0,
      created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id integer PRIMARY KEY AUTOINCREMENT,
      overview_badge text,
      overview_title text,
      overview_description text,
      total_projects int NOT NULL DEFAULT 0,
      years_experience int NOT NULL DEFAULT 0,
      happy_clients int NOT NULL DEFAULT 0,
      team_size int NOT NULL DEFAULT 0,
      hero_image text,
      logo_image text,
      updated_at text NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function maybeSeedTable() {
  if (!db) return;
  const [{ count: projectCount }] = await db.select({ count: count() }).from(projects);
  if (Number(projectCount) === 0) {
    await db.insert(projects).values(projectSeed.map((project) => ({ ...project, images: JSON.stringify(project.images), features: JSON.stringify(project.features ?? []), amenities: JSON.stringify(project.amenities ?? []), featured: Boolean(project.featured) })));
  } else {
    for (const project of projectSeed) {
      await db.update(projects).set({
        slug: project.slug,
        images: JSON.stringify(project.images),
        features: JSON.stringify(project.features ?? []),
        amenities: JSON.stringify(project.amenities ?? [])
      }).where(eq(projects.title, project.title));
    }
  }

  const [{ count: serviceCount }] = await db.select({ count: count() }).from(services);
  if (Number(serviceCount) === 0) {
    await db.insert(services).values(serviceSeed.map((service) => ({ ...service, features: JSON.stringify(service.features) })));
  }

  const [{ count: testimonialCount }] = await db.select({ count: count() }).from(testimonials);
  if (Number(testimonialCount) === 0) {
    await db.insert(testimonials).values(testimonialSeed.map((testimonial) => ({ ...testimonial, featured: Boolean(testimonial.featured) })));
  }

  const [{ count: teamCount }] = await db.select({ count: count() }).from(team);
  if (Number(teamCount) === 0) {
    await db.insert(team).values(teamSeed.map((member) => ({ ...member })));
  }

  const [{ count: callbackCount }] = await db.select({ count: count() }).from(callbacks);
  if (Number(callbackCount) === 0) {
    await db.insert(callbacks).values(callbackSeed.map((callback) => ({ ...callback })));
  }

  // Seed site settings with sensible defaults if empty
  try {
    const [{ count: settingsCount }] = await db.select({ count: count() }).from(siteSettings as any);
    if (Number(settingsCount) === 0) {
      await db.insert(siteSettings as any).values({ overviewBadge: "Since 2010", overviewTitle: "Measured delivery. Elevated living.", overviewDescription: "A concise view of scale, trust, and delivery discipline across premium residential and commercial assets.", totalProjects: 0, yearsExperience: 9, happyClients: 40, teamSize: 12 });
    }
  } catch (e) {
    // ignore if older DB versions or import quirks
  }

  // Seed admin user
  try {
    const [{ count: userCount }] = await db.select({ count: count() }).from((await import("../../../lib/db/src/index.js")).users as any);
    if (Number(userCount) === 0) {
      const adminUser = env.ADMIN_USERNAME ?? "admin";
      const adminPass = env.ADMIN_PASSWORD ?? "changeme123";
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = crypto.pbkdf2Sync(adminPass, salt, 100000, 32, "sha256").toString("hex") + ":" + salt;
      await db.run(`CREATE TABLE IF NOT EXISTS users (id integer PRIMARY KEY AUTOINCREMENT, username text NOT NULL, password_hash text NOT NULL, role text NOT NULL DEFAULT 'admin', created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.insert((await import("../../../lib/db/src/index.js")).users as any).values({ username: adminUser, passwordHash: hash, role: "admin" });
    }
  } catch (e) {
    // ignore if users table is not yet available in older DBs
  }
}

export async function seedDatabase() {
  if (!db) return;
  await createTables();
  await maybeSeedTable();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => {
    process.stdout.write("Seeded database\n");
  });
}
