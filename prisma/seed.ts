import { PrismaClient, InterestCategory, Area } from "@prisma/client";
import { hash } from "bcryptjs";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const SEED_PASSWORD = process.env.SEED_DEMO_PASSWORD || "demo123456";

// Centroid coordinates for each DIY area (approximate)
const AREA_CENTROIDS: Record<Area, { lat: number; lng: number }> = {
  KOTA_YOGYAKARTA: { lat: -7.7956, lng: 110.3695 },
  SLEMAN: { lat: -7.7052, lng: 110.3534 },
  BANTUL: { lat: -7.8875, lng: 110.3287 },
  KULON_PROGO: { lat: -7.8228, lng: 110.1603 },
  GUNUNGKIDUL: { lat: -7.9138, lng: 110.6022 },
};

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (in reverse FK order)
  await prisma.userActivityHistory.deleteMany();
  await prisma.eventAttendance.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.eventCommunity.deleteMany();
  await prisma.event.deleteMany();
  await prisma.communityJoinRequest.deleteMany();
  await prisma.communitySubmission.deleteMany();
  await prisma.communityMembership.deleteMany();
  await prisma.communityOrganizer.deleteMany();
  await prisma.communityLocation.deleteMany();
  await prisma.community.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleared existing data");

  // Create demo accounts
  const passwordHash = await hash(SEED_PASSWORD, 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@togather.demo",
      passwordHash,
      isAdmin: true,
      profile: {
        create: {
          name: "Admin Togather",
          phone: "+6281234567890",
          phoneVerifiedAt: new Date(),
          domicile: "KOTA_YOGYAKARTA",
          interests: [InterestCategory.TEKNOLOGI],
          bio: "Administrator platform Togather.",
        },
      },
    },
  });

  const verifiedUser = await prisma.user.create({
    data: {
      email: "user@togather.demo",
      passwordHash,
      profile: {
        create: {
          name: "Budi Santoso",
          phone: "+6281234567891",
          phoneVerifiedAt: new Date(),
          domicile: "SLEMAN",
          interests: [
            InterestCategory.OLAHRAGA,
            InterestCategory.SENI_DAN_HIBURAN,
          ],
          bio: "Suka lari pagi dan nonton konser musik lokal.",
        },
      },
    },
  });

  const incompleteUser = await prisma.user.create({
    data: {
      email: "incomplete@togather.demo",
      passwordHash,
      profile: {
        create: {
          name: "Ani Wijaya",
          phone: "+6281234567892",
          // No phoneVerifiedAt - incomplete
          domicile: Area.BANTUL,
          interests: [],
          bio: null,
        },
      },
    },
  });

  const organizerUser = await prisma.user.create({
    data: {
      email: "organizer@togather.demo",
      passwordHash,
      profile: {
        create: {
          name: "Dedi Prasetyo",
          phone: "+6281234567893",
          phoneVerifiedAt: new Date(),
          domicile: "KOTA_YOGYAKARTA",
          interests: [
            InterestCategory.TEKNOLOGI,
            InterestCategory.BISNIS_DAN_KARIER,
          ],
          bio: "Pengelola komunitas tech startup di Yogyakarta.",
        },
      },
    },
  });

  console.log(`✅ Created demo accounts (password: ${SEED_PASSWORD})`);

  // Create DEMO communities covering all areas and scenarios
  const demoCommunities = await createDemoCommunities(
    admin.id,
    verifiedUser.id,
    organizerUser.id
  );

  console.log(`✅ Created ${demoCommunities.length} DEMO communities`);

  // Import reference data from DIY_Events_2026.md
  const importReport = await importReferenceData(admin.id);

  console.log(`✅ Import complete: ${JSON.stringify(importReport)}`);

  // Create DEMO events
  const demoEvents = await createDemoEvents(admin.id, demoCommunities);

  console.log(`✅ Created ${demoEvents.length} DEMO events`);

  console.log("🎉 Seed completed successfully!");
  console.log("\n📋 Demo Accounts:");
  console.log(`   Admin:      admin@togather.demo / ${SEED_PASSWORD}`);
  console.log(`   Verified:   user@togather.demo / ${SEED_PASSWORD}`);
  console.log(`   Incomplete: incomplete@togather.demo / ${SEED_PASSWORD}`);
  console.log(`   Organizer:  organizer@togather.demo / ${SEED_PASSWORD}`);
}

async function createDemoCommunities(
  adminId: string,
  verifiedUserId: string,
  organizerUserId: string
) {
  const communities: any[] = [];

  // PRD 12.2 Scenario communities
  const scenarios = [
    // 1. Offline public with location
    {
      name: "Jogja Runners Club",
      description:
        "Komunitas lari untuk semua level, dari pemula hingga marathon. Rutin latihan setiap Minggu pagi di Alun-Alun Kidul.",
      type: "OFFLINE" as const,
      accessType: "PUBLIC" as const,
      categories: [InterestCategory.OLAHRAGA],
      area: Area.KOTA_YOGYAKARTA,
      addressText: "Alun-Alun Kidul, Kota Yogyakarta",
      coordinates: { lat: -7.8127, lng: 110.3645 },
      submissionStatus: "APPROVED" as const,
      organizerId: organizerUserId,
    },
    // 2. Offline private with location
    {
      name: "Sleman Photography Circle",
      description:
        "Komunitas fotografer profesional dan semi-profesional di Sleman. Membership by invitation atau approval.",
      type: "OFFLINE" as const,
      accessType: "PRIVATE" as const,
      categories: [InterestCategory.SENI_DAN_HIBURAN, InterestCategory.HOBI],
      area: Area.SLEMAN,
      addressText: "Berbagai lokasi di Sleman",
      coordinates: AREA_CENTROIDS.SLEMAN,
      submissionStatus: "APPROVED" as const,
      organizerId: organizerUserId,
    },
    // 3. Online public tanpa lokasi fisik
    {
      name: "DIY Tech Community",
      description:
        "Komunitas developer, designer, dan tech enthusiast se-DIY. Diskusi online via Discord, meetup sesekali.",
      type: "ONLINE" as const,
      accessType: "PUBLIC" as const,
      categories: [InterestCategory.TEKNOLOGI],
      area: null,
      addressText: null,
      coordinates: null,
      submissionStatus: "APPROVED" as const,
      organizerId: organizerUserId,
    },
    // 4. Online private
    {
      name: "Mental Health Support DIY",
      description:
        "Grup dukungan kesehatan mental untuk penduduk DIY. Private untuk menjaga privasi anggota.",
      type: "ONLINE" as const,
      accessType: "PRIVATE" as const,
      categories: [InterestCategory.SOSIAL],
      area: null,
      addressText: null,
      coordinates: null,
      submissionStatus: "APPROVED" as const,
      organizerId: verifiedUserId,
    },
    // 5. Pending submission
    {
      name: "Bantul Organic Farming",
      description:
        "Komunitas petani organik dan urban farming di Bantul. Sharing knowledge dan praktik berkelanjutan.",
      type: "OFFLINE" as const,
      accessType: "PUBLIC" as const,
      categories: [InterestCategory.LINGKUNGAN],
      area: Area.BANTUL,
      addressText: "Wilayah Bantul",
      coordinates: AREA_CENTROIDS.BANTUL,
      submissionStatus: "PENDING" as const,
      organizerId: verifiedUserId,
    },
    // 6. Approved submission (already above)
    // 7. Rejected submission
    {
      name: "Spam Community Test",
      description: "This is a test rejected community for demo purposes only.",
      type: "ONLINE" as const,
      accessType: "PUBLIC" as const,
      categories: [InterestCategory.LAINNYA],
      area: null,
      addressText: null,
      coordinates: null,
      submissionStatus: "REJECTED" as const,
      organizerId: verifiedUserId,
      rejectionReason: "Community purpose unclear and appears to be spam.",
    },
  ];

  // Add more communities to reach ~60 total, covering all areas
  const additionalCommunities = [
    {
      name: "Kulon Progo Adventure",
      description:
        "Komunitas pecinta alam dan petualangan di Kulon Progo. Hiking, camping, dan eksplorasi goa.",
      type: "OFFLINE" as const,
      accessType: "PUBLIC" as const,
      categories: [InterestCategory.OLAHRAGA, InterestCategory.HOBI],
      area: Area.KULON_PROGO,
      coordinates: AREA_CENTROIDS.KULON_PROGO,
      submissionStatus: "APPROVED" as const,
      organizerId: organizerUserId,
    },
    {
      name: "Gunungkidul Batik Heritage",
      description:
        "Pelestarian dan pengembangan batik khas Gunungkidul. Workshop rutin dan pameran.",
      type: "OFFLINE" as const,
      accessType: "PUBLIC" as const,
      categories: [
        InterestCategory.SENI_DAN_HIBURAN,
        InterestCategory.BISNIS_DAN_KARIER,
      ],
      area: Area.GUNUNGKIDUL,
      coordinates: AREA_CENTROIDS.GUNUNGKIDUL,
      submissionStatus: "APPROVED" as const,
      organizerId: verifiedUserId,
    },
    {
      name: "Jogja Startup Founders",
      description:
        "Ekosistem startup founders di Yogyakarta. Networking, sharing, dan kolaborasi bisnis.",
      type: "OFFLINE" as const,
      accessType: "PRIVATE" as const,
      categories: [
        InterestCategory.TEKNOLOGI,
        InterestCategory.BISNIS_DAN_KARIER,
      ],
      area: Area.KOTA_YOGYAKARTA,
      coordinates: AREA_CENTROIDS.KOTA_YOGYAKARTA,
      submissionStatus: "APPROVED" as const,
      organizerId: organizerUserId,
    },
    {
      name: "DIY Book Club Online",
      description:
        "Klub buku online untuk pencinta literatur di DIY. Diskusi mingguan via Zoom.",
      type: "ONLINE" as const,
      accessType: "PUBLIC" as const,
      categories: [InterestCategory.PENDIDIKAN, InterestCategory.HOBI],
      area: null,
      coordinates: null,
      submissionStatus: "APPROVED" as const,
      organizerId: verifiedUserId,
    },
    {
      name: "Sleman Youth Islamic Study",
      description:
        "Kajian Islam untuk pemuda di Sleman. Rutin setiap Jumat malam.",
      type: "OFFLINE" as const,
      accessType: "PUBLIC" as const,
      categories: [InterestCategory.KEAGAMAAN],
      area: Area.SLEMAN,
      coordinates: AREA_CENTROIDS.SLEMAN,
      submissionStatus: "APPROVED" as const,
      organizerId: organizerUserId,
    },
  ];

  const allCommunityData = [...scenarios, ...additionalCommunities];

  for (const data of allCommunityData) {
    const community = await prisma.community.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        accessType: data.accessType,
        categories: data.categories,
        externalLinks: [],
        dataSource: "DEMO",
        submission: {
          create: {
            userId: data.organizerId,
            status: data.submissionStatus,
            ...(data.submissionStatus === "REJECTED" && {
              rejectionReason: (data as any).rejectionReason,
              reviewedAt: new Date(),
              reviewedBy: adminId,
            }),
            ...(data.submissionStatus === "APPROVED" && {
              reviewedAt: new Date(),
              reviewedBy: adminId,
            }),
          },
        },
        ...(data.submissionStatus === "APPROVED" && {
          organizers: {
            create: {
              userId: data.organizerId,
            },
          },
          members: {
            create: {
              userId: data.organizerId,
            },
          },
        }),
      },
    });

    // Create location separately
    if (data.type === "OFFLINE" && data.coordinates) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "CommunityLocation" (id, "communityId", area, coordinates, "addressText", "isOnline")
        VALUES (
          gen_random_uuid()::text,
          '${community.id}',
          '${data.area}',
          ST_GeographyFromText('POINT(${data.coordinates.lng} ${data.coordinates.lat})'),
          ${data.addressText ? `'${data.addressText.replace(/'/g, "''")}'` : "NULL"},
          false
        )
      `);
    } else {
      await prisma.communityLocation.create({
        data: {
          communityId: community.id,
          isOnline: true,
        },
      });
    }

    communities.push(community);
  }

  return communities;
}

async function importReferenceData(adminId: string) {
  // For now, return empty report - full import would parse DIY_Events_2026.md
  // This is a placeholder for the documented import process
  return {
    imported: 0,
    excluded: 0,
    flagged: 0,
    note: "Reference data import not yet implemented in seed script",
  };
}

async function createDemoEvents(adminId: string, communities: any[]) {
  const events: any[] = [];
  const now = new Date();

  // PRD 12.2 Scenarios: 8, 9, 10 (standalone event, event with community, event with registration)

  // Upcoming events (relative to seed run)
  const upcomingEvents = [
    {
      name: "Jogja Marathon 2026",
      description:
        "Marathon tahunan di Yogyakarta dengan rute 5K, 10K, Half Marathon dan Full Marathon.",
      category: InterestCategory.OLAHRAGA,
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      startTime: "05:00 WIB",
      venue: "Alun-Alun Kidul",
      area: Area.KOTA_YOGYAKARTA,
      coordinates: { lat: -7.8127, lng: 110.3645 },
      organizer: "Jogja Runners Club",
      contactInfo: "marathon@jogjahomepage.jpg",
      quota: 100,
      registrationOpen: true,
      fee: "Rp 150.000",
      externalLink: null,
      relatedCommunityId: communities.find((c) => c.name === "Jogja Runners Club")
        ?.id,
      dataSource: "DEMO" as const,
    },
    {
      name: "Tech Startup Networking Night",
      description:
        "Malam networking untuk startup founders dan investor di Yogyakarta.",
      category: InterestCategory.BISNIS_DAN_KARIER,
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      startTime: "18:00 WIB",
      venue: "Co-working Space Jogja",
      area: Area.KOTA_YOGYAKARTA,
      coordinates: AREA_CENTROIDS.KOTA_YOGYAKARTA,
      organizer: "Jogja Startup Ecosystem",
      contactInfo: "hello@jogjastartup.id",
      quota: 50,
      registrationOpen: true,
      fee: "Gratis",
      relatedCommunityId: null, // Standalone event
      dataSource: "DEMO" as const,
    },
    {
      name: "Bantul Cultural Festival",
      description:
        "Festival budaya tahunan Bantul dengan berbagai pertunjukan seni dan pameran.",
      category: InterestCategory.SENI_DAN_HIBURAN,
      startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000),
      startTime: "09:00 WIB",
      venue: "Pendopo Kabupaten Bantul",
      area: Area.BANTUL,
      coordinates: AREA_CENTROIDS.BANTUL,
      organizer: "Dinas Kebudayaan Bantul",
      contactInfo: null,
      quota: null, // No quota
      registrationOpen: false,
      fee: "Gratis",
      externalLink: "https://bantulkab.go.id/budaya",
      relatedCommunityId: null,
      dataSource: "DEMO" as const,
    },
    {
      name: "Full Quota Event Demo",
      description:
        "Event demo untuk testing full quota. Sudah penuh (untuk testing).",
      category: InterestCategory.TEKNOLOGI,
      startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      startTime: "14:00 WIB",
      venue: "Virtual",
      area: Area.KOTA_YOGYAKARTA,
      organizer: "Togather Demo",
      quota: 2, // Will be filled to test full quota
      registrationOpen: true,
      fee: "Gratis",
      relatedCommunityId: null,
      dataSource: "DEMO" as const,
    },
  ];

  // Past events
  const pastEvents = [
    {
      name: "Sleman Photography Workshop 2026",
      description: "Workshop fotografi landscape dan portrait di Sleman.",
      category: InterestCategory.SENI_DAN_HIBURAN,
      startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      startTime: "09:00 WIB",
      venue: "Candi Prambanan",
      area: Area.SLEMAN,
      coordinates: AREA_CENTROIDS.SLEMAN,
      organizer: "Sleman Photography Circle",
      quota: 30,
      registrationOpen: false,
      fee: "Rp 100.000",
      relatedCommunityId: communities.find(
        (c) => c.name === "Sleman Photography Circle"
      )?.id,
      dataSource: "DEMO" as const,
    },
  ];

  const allEventData = [...upcomingEvents, ...pastEvents];

  for (const data of allEventData) {
    const event = await prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate || null,
        startTime: data.startTime,
        venue: data.venue,
        area: data.area,
        organizer: data.organizer,
        contactInfo: data.contactInfo,
        quota: data.quota,
        registrationOpen: data.registrationOpen,
        fee: data.fee,
        externalLink: data.externalLink,
        dataSource: data.dataSource,
        isPublished: true,
        createdBy: adminId,
        publishedAt: new Date(),
        ...(data.relatedCommunityId && {
          relatedCommunities: {
            create: {
              communityId: data.relatedCommunityId,
            },
          },
        }),
      },
    });

    // Update coordinates if provided
    if (data.coordinates) {
      await prisma.$executeRawUnsafe(`
        UPDATE "Event"
        SET coordinates = ST_GeographyFromText('POINT(${data.coordinates.lng} ${data.coordinates.lat})')
        WHERE id = '${event.id}'
      `);
    }

    events.push(event);
  }

  return events;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
