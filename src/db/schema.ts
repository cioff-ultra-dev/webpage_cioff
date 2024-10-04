import { relations, SQL, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  date,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { AdapterAccountType } from "next-auth/adapters";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import {
  NationalSectionPositionsLangProd,
  NationalSectionProd,
} from "./schemaCustom";

// Custom SQL Function
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

// Enums
export const stateModeEnum = pgEnum("state_mode", ["offline", "online"]);
export const langCodeEnum = pgEnum("lang_code", ["en", "es", "fr"]);

// export const cioffSchema = pgSchema("prod"); // cioffSchema.table

/*
1. USER MODULE:
Roles
Permissions
Roles to Permissions
Status
Users
Account
Session
Verification Token
Authenticator

2. SYSTEM:
Languages
Social Media Links
Storage

3. COUNTRY MODULE:
Countries
Countries Lang
*/

export const RolesProd = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const PermissionsProd = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const RolesToPermissionsProd = pgTable("roles_to_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => RolesProd.id),
  permissionId: integer("permission_id").references(() => PermissionsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const LanguagesProd = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: langCodeEnum("code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CountriesProd = pgTable("countries", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  lat: text("lat"),
  lng: text("lng"),
  nativeLang: integer("native_lang").references(() => LanguagesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CountriesLangProd = pgTable("countries_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  countryId: integer("country_id").references(() => CountriesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const StatusesProd = pgTable("statuses", {
  id: serial("id").primaryKey(),
  name: text("name"),
  slug: text("slug"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const StatusesLangProd = pgTable("statuses_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  statusId: integer("status_id").references(() => StatusesProd.id),
  lang: integer("lang_id").references(() => LanguagesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const StorageProd = pgTable("storage", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  name: text("name"),
  aux: text("aux"),
  keywords: text("keywords"),
  lang: integer("lang").references(() => LanguagesProd.id),
  isFile: boolean("is_file").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const UsersProd = pgTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roleId: integer("role_id").references(() => RolesProd.id),
    countryId: integer("country_id").references(() => CountriesProd.id),
    title: text("title"),
    name: text("name"),
    firstname: text("firstname"),
    lastname: text("lastname"),
    email: text("email").notNull().unique(),
    address: text("address"),
    city: text("city"),
    zip: text("zip"),
    phone: text("phone"),
    image: integer("image_id").references(() => StorageProd.id),
    password: text("password"),
    active: boolean("active").default(false),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    isCreationNotified: boolean("is_creation_notified").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    emailUniqueIndex: uniqueIndex("emailUniqueIndex").on(lower(table.email)),
  })
);
export const AccountsProd = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => UsersProd.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);
export const SessionsProd = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => UsersProd.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
export const VerificationTokenProd = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);
export const SessionsContainerProd = pgTable("session_group", {
  id: serial("id").primaryKey(),
});
export const AuthenticatorProd = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => UsersProd.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);
export const SocialMediaLinksProd = pgTable("social_media_links", {
  id: serial("id").primaryKey(),
  facebookLink: text("facebook_link"),
  instagramLink: text("instagram_link"),
  websiteLink: text("website_link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const OtherSociaMediaLinksProd = pgTable("other_social_media_links", {
  id: serial("id").primaryKey(),
  name: text("name"),
  link: text("link"),
  socialMediaLinkId: integer("social_media_link_id").references(
    () => SocialMediaLinksProd.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/*
4. NATIONAL SECTION MODULE:
National Section
National Section Lang
National Section Positions
National Section Positions Lang
*/

export const NationalSectionsProd = pgTable("national_section", {
  id: serial("id").primaryKey(),
  published: boolean("published").default(false),
  slug: text("slug").notNull(),
  socialMediaLinksId: integer("socia_media_links_id").references(
    () => SocialMediaLinksProd.id
  ),
  countryId: integer("country_id").references(() => CountriesProd.id),
  createdBy: text("created_by").references(() => UsersProd.id),
  updatedBy: text("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const NationalSectionsLangProd = pgTable("national_section_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  about: text("about"),
  lang: integer("lang").references(() => LanguagesProd.id),
  nsId: integer("ns_id").references(() => NationalSectionsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const NationalSectionsPositionsProd = pgTable(
  "national_section_positions",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    birthDate: date("birth_date", { mode: "date" }),
    deadDate: date("dead_date", { mode: "date" }),
    isHonorable: boolean("is_honorable").default(false),
    photoId: integer("photo_id").references(() => StorageProd.id),
    nsId: integer("ns_id").references(() => NationalSectionsProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const NationalSectionsPositionsTest = pgTable(
  "national_section_positions_test",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    countryName: text("country_name"),
    birthDate: date("birth_date", { mode: "date" }),
    deadDate: date("dead_date", { mode: "date" }),
    isHonorable: boolean("is_honorable").default(false),
    countryId: integer("country_id").references(() => CountriesProd.id),
    nsId: integer("ns_id").references(() => NationalSectionsProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const NationalSectionPositionsLang = pgTable(
  "national_section_positions_lang",
  {
    id: serial("id").primaryKey(),
    shortBio: text("short_bio").notNull(),
    lang: integer("lang").references(() => LanguagesProd.id),
    nsPositionsId: integer("ns_positions_id").references(
      () => NationalSectionsPositionsProd.id
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

/*
5. CATEGORY MODULE:
Categories
Categories Lang

6. FESTIVAL MODULE:
Events
Festivals Lang
Festivals
Festivals Photos
Festival to categories
*/

export const CategoryGroupsProd = pgTable("category_groups", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CategoriesProd = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  categoryGroupId: integer("category_group_id").references(
    () => CategoryGroupsProd.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CategoriesLangProd = pgTable("categories_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  caption: text("caption"),
  lang: integer("lang").references(() => LanguagesProd.id),
  categoryId: integer("category_id").references(() => CategoriesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalsProd = pgTable("festivals", {
  id: serial("id").primaryKey(),
  slug: text("slug").default(""),
  email: text("email"),
  url: text("url"),
  contact: text("contact").notNull().default(""),
  urlValidated: boolean("url_validated"),
  phone: text("phone"),
  stateMode: stateModeEnum("state_mode").default("offline"),
  location: text("location"),
  lat: text("lat"),
  lng: text("lng"),
  transportLat: text("transport_lat"),
  transportLng: text("transport_lng"),
  translatorLanguages: text("translator_languages"),
  peoples: integer("peoples"),
  youtubeId: text("youtube_id"),
  directorName: text("director_name").notNull().default(""),
  categories: text("categories"),
  published: boolean("publish"),
  statusId: integer("status_id").references(() => StatusesProd.id),
  nsId: integer("ns_id").references(() => NationalSectionsProd.id),
  certificationMemberId: integer("certification_member_id").references(
    () => StorageProd.id
  ),
  countryId: integer("country_id").references(() => CountriesProd.id),
  logoId: integer("logo_id").references(() => StorageProd.id),
  coverId: integer("cover_id").references(() => StorageProd.id),
  createdBy: text("created_by").references(() => UsersProd.id),
  updatedBy: text("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalsLangProd = pgTable("festivals_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  description: text("description").default(""),
  address: text("address"),
  otherTranslatorLanguage: text("other_translator_language"),
  lang: integer("lang").references(() => LanguagesProd.id),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalPhotosProd = pgTable("festival_photos", {
  id: serial("id").primaryKey(),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  photoId: integer("photo_id").references(() => StorageProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalToCategoriesProd = pgTable(
  "festival_to_categories",
  {
    festivalId: integer("festival_id").references(() => FestivalsProd.id),
    categoryId: integer("category_id").references(() => CategoriesProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.festivalId, t.categoryId] }),
  })
);
export const festivalsToStatuses = pgTable(
  "festivals_to_statuses",
  {
    festivalId: integer("festival_id").references(() => FestivalsProd.id),
    statusId: integer("status_id").references(() => StatusesProd.id),
    question: text("question"),
    answer: text("text"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.festivalId, t.statusId] }),
  })
);
export const EventsProd = pgTable("events", {
  id: serial("id").primaryKey(),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  nsId: integer("ns_id").references(() => NationalSectionsProd.id), // TODO No se me hace necesario
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const EventsLangProd = pgTable("events_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  lang: integer("lang").references(() => LanguagesProd.id),
  eventId: integer("event_id").references(() => EventsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/*
7. GROUP MODULE:
Type groups
Groups
Groups Lang
EventsToGroups
*/

export const GroupsProd = pgTable("groups", {
  id: serial("id").primaryKey(),
  generalDirectorName: text("general_director_name"),
  generalDirectorPhoto: text("general_director_photo"),
  artisticDirectorName: text("artistic_director_name"),
  artisticDirectorPhoto: text("artistic_director_photo"),
  musicalDirectorName: text("musical_director_name"),
  musicalDirectorPhoto: text("musical_director_photo"),
  isAbleTravelLiveMusic: boolean("is_able_travel_live_music").default(false),
  membersNumber: integer("members_number"),
  phone: text("phone"),
  generalDirectorPhotoId: integer("general_director_photo_id").references(
    () => StorageProd.id
  ),
  artisticDirectorPhotoId: integer("artistic_director_photo_id").references(
    () => StorageProd.id
  ),
  musicalDirectorPhotoId: integer("musical_director_photo_id").references(
    () => StorageProd.id
  ),
  nsId: integer("ns_id").references(() => NationalSectionsProd.id),
  countryId: integer("country_id").references(() => CountriesProd.id),
  certificationMemberId: integer("certification_member_id").references(
    () => StorageProd.id
  ),
  createdBy: text("created_by").references(() => UsersProd.id),
  updatedBy: text("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const GroupsLangProd = pgTable("groups_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  address: text("address"),
  generalDirectorProfile: text("general_director_profile"),
  artisticDirectorProfile: text("artistic_director_profile"),
  musicalDirectorProfile: text("musical_director_profile"),
  lang: integer("lang").references(() => LanguagesProd.id),
  groupId: integer("group_id").references(() => GroupsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const EventsToGroupsProd = pgTable("events_to_groups", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => EventsProd.id),
  groupId: integer("group_id").references(() => GroupsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const GroupToCategoriesProd = pgTable(
  "group_to_categories",
  {
    groupId: integer("group_id").references(() => GroupsProd.id),
    categoryId: integer("category_id").references(() => CategoriesProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.categoryId] }),
  })
);
export const SubgroupsProd = pgTable("subgroups", {
  id: serial("id").primaryKey(),
  membersNumber: integer("members_number"),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  groupId: integer("group_id").references(() => GroupsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const SubgroupsLangProd = pgTable("subgroups_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  contactAddress: text("contact_address"),
  subgroupId: integer("subgroup_id").references(() => SubgroupsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const SubgroupToCategoriesProd = pgTable(
  "subgroup_to_categories",
  {
    subgroupId: integer("subgroup_id").references(() => SubgroupsProd.id),
    categoryId: integer("category_id").references(() => CategoriesProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.subgroupId, t.categoryId] }),
  })
);

/*
8. TIMELINE
Timeline
Timeline Lang

9. WEBSITE MODULE
Design
Menu
Menu Lang

10. Announcements
Announcements
Announcements files
*/

export const TimelineProd = pgTable("timeline", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  videoId: text("video_id"),
  mediaId: integer("media_id").references(() => StorageProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const TimelineLangProd = pgTable("timeline_lang", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  timelineId: integer("timeline_id").references(() => TimelineProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const DesignProd = pgTable("design", {
  id: serial("id").primaryKey(),
  bannerMediaId: integer("banner_media_id")
    .references(() => StorageProd.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const MenuProd = pgTable("menu", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  order: integer("order"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const MenuLangProd = pgTable("menu_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  lang: integer("lang").references(() => LanguagesProd.id),
  menuId: integer("menu_id").references(() => MenuProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const AnnouncementsProd = pgTable("announcements", {
  id: serial("id").primaryKey(),
  to: text("to").notNull(),
  from: text("from").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  categoryNames: text("category_names").notNull(),
  createdBy: text("created_by").references(() => UsersProd.id),
  updatedBy: text("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const AnnouncementsFilesProd = pgTable("announcements_files", {
  id: serial("id").primaryKey(),
  announcementId: integer("announcement_id").references(
    () => AnnouncementsProd.id
  ),
  mediaId: integer("media_id").references(() => StorageProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/*
11. PAGES
Sub Pages
Sub Pages Docs
Sub Pages Texts Lang
*/

export const SubPagesProd = pgTable("sub_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  url: text("url").notNull(),
  isNews: boolean("is_news").default(false),
  originalDate: timestamp("original_date", { mode: "date" }).notNull(),
  published: boolean("published").default(false),
  createdBy: text("created_by").references(() => UsersProd.id),
  updatedBy: text("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const SubPagesTextsLangProd = pgTable("sub_pages_texts_lang", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  subPageId: integer("subpage_id").references(() => SubPagesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 12. Owers */

export const OwnersProd = pgTable("owners", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => UsersProd.id),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  groupId: integer("group_id").references(() => GroupsProd.id),
  nsId: integer("ns_id").references(() => NationalSectionsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 13. Type Reports */

export const ReportTypeCategoriesProd = pgTable("report_type_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  oriented_to: text("oriented_to"),
  subType: text("subType"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ReportTypeCategoriesNsLangProd = pgTable(
  "report_type_categories_lang",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    lang: integer("lang")
      .references(() => LanguagesProd.id)
      .notNull(),
    reportTypeCategoryId: integer("report_type_category_id")
      .references(() => ReportTypeCategoriesProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

/* 14. Rating Questions */

export const RatingTypeProd = pgTable("rating_type", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const RatingQuestionsProd = pgTable("rating_questions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  ratingTypeId: integer("rating_type_id").references(() => RatingTypeProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const RatingQuestionsLangProd = pgTable("rating_questions_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  tooltip: text("tooltip"),
  lang: integer("lang")
    .references(() => LanguagesProd.id)
    .notNull(),
  ratingQuestionlId: integer("rating_question_id")
    .references(() => RatingQuestionsProd.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 15. NS Reports */

export const ReportNsProd = pgTable("report_ns", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  festivalSize: integer("festival_size"),
  groupSize: integer("group_size"),
  associationSize: integer("association_size"),
  individualMemberSize: integer("individual_memeber_size"),
  activeNationalCommission: boolean("active_national_commission"),
  nsId: integer("ns_id")
    .references(() => NationalSectionsProd.id)
    .notNull(),
  numberFestivals: integer("number_festivals"),
  numberGroups: integer("number_groups"),
  numberAssociationsOrOtherOrganizations: integer(
    "number_associations_or_other_organizations"
  ),
  numberIndividualMembers: integer("number_individual_members"),
  isActivelyEngagedNc: boolean("is_actively_engaged_nc"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ReportNsLangProd = pgTable("report_ns_lang", {
  id: serial("id").primaryKey(),
  title: text("title"),
  comment: text("comment"),
  workDescription: text("work_description"), // TODO se movio desde reports ns
  lang: integer("lang")
    .references(() => LanguagesProd.id)
    .notNull(),
  reportNsId: integer("report_ns_id")
    .references(() => ReportNsProd.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ReportNsActivitiesProd = pgTable("report_ns_activities", {
  id: serial("id").primaryKey(),
  reportTypeCategoryId: integer("report_type_category_id")
    .references(() => ReportTypeCategoriesProd.id)
    .notNull(),
  reportNsId: integer("report_ns_id")
    .references(() => ReportNsProd.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 16. Festivals Reports */

export const ReportFestivalProd = pgTable("report_festival", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  festivalId: integer("festival_id")
    .references(() => FestivalsProd.id)
    .notNull(),
  amountPeople: integer("amount_people"),
  disabledAdults: integer("any_disabled_adults"),
  disabledYouth: integer("any_disabled_youth"),
  disabledChildren: integer("any_disabled_children"),
  amountPerformances: integer("amount_performances"),
  averageCostTicket: integer("average_cost_ticket"),
  sourceData: text("source_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ReportFestivalActivitiesProd = pgTable(
  "report_festival_activities",
  {
    id: serial("id").primaryKey(),
    reportTypeCategoryId: integer("report_type_category_id")
      .references(() => ReportTypeCategoriesProd.id)
      .notNull(),
    reportFestivalId: integer("report_festival_id")
      .references(() => ReportFestivalProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

/* 17. Festival Rating */

export const RatingFestivalToGroupsProd = pgTable("rating_festival_to_groups", {
  id: serial("id").primaryKey(),
  ratingResult: integer("rating_result").notNull(),
  reportFestivalId: integer("report_festival_id")
    .references(() => ReportFestivalProd.id)
    .notNull(),
  groupId: integer("group_id").references(() => GroupsProd.id),
  nameNoCioffGroup: text("name_no_cioff_group"),
  amountPersonsGroup: integer("amount_persons_group"),
  isInvitationPerWebsite: boolean("is_invitation_per_website"),
  isInvitationPerNs: boolean("is_invitation_per_ns"),
  isGroupLiveMusic: boolean("is_group_live_music"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const RatingFestivalToGroupsAnswersProd = pgTable(
  "rating_festival_to_groups_answers",
  {
    id: serial("id").primaryKey(),
    rating: integer("rating").notNull(),
    ratingFestivalToGroupsId: integer("rating_festival_to_groups_id")
      .references(() => RatingFestivalToGroupsProd.id)
      .notNull(),
    ratingQuestionId: integer("rating_question_id")
      .references(() => RatingQuestionsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const RatingFestivalToGroupsAnswersLangProd = pgTable(
  "rating_festival_to_groups_answers_lang",
  {
    id: serial("id").primaryKey(),
    comment: text("comment"),
    lang: integer("lang")
      .references(() => LanguagesProd.id)
      .notNull(),
    ratingFestivalToGroupsAnswersId: integer(
      "rating_festival_to_groups_answers_id"
    )
      .references(() => RatingFestivalToGroupsAnswersProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const RatingFestivalResultsLangProd = pgTable(
  "rating_festival_results_lang",
  {
    id: serial("id").primaryKey(),
    comment: text("comment"),
    lang: integer("lang")
      .references(() => LanguagesProd.id)
      .notNull(),
    ratingFestivalToGroupsId: integer("rating_festival_to_groups_id")
      .references(() => RatingFestivalToGroupsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

/* 18. Groups Reports */

export const ReportGroupProd = pgTable("report_group", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  groupId: integer("group_id")
    .references(() => GroupsProd.id)
    .notNull(),
  amountPersonsTravelled: integer("amount_persons_travelled"),
  ich: text("ich"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 19. Group Rating */

export const RatingGroupToFestivalsProd = pgTable("rating_group_to_festivals", {
  id: serial("id").primaryKey(),
  ratingResult: integer("rating_result").notNull(),
  reportGroupId: integer("report_group_id")
    .references(() => ReportGroupProd.id)
    .notNull(),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  nameNoCioffFestival: text("name_no_cioff_festival"),
  introductionBeforePerformances: boolean("introduction_before_performances"),
  isLogosPresent: boolean("is_logos_present"),
  atLeast5ForeginGroups: boolean("at_least_5_foregin_groups"),
  festivalCoverTravelCosts: boolean("festival_cover_travel_costs"),
  refreshmentsDuringPerformances: boolean("refreshments_during_performances"),
  financialCompensationPerMember: integer("financial_compensation_per_member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ReportGroupTypeLocalesProd = pgTable("report_group_type_locales", {
  id: serial("id").primaryKey(),
  reportTypeCategoryId: integer("report_type_category_id")
    .references(() => ReportTypeCategoriesProd.id)
    .notNull(),
  reportGroupToFestivalsId: integer("report_group_to_festivals_id")
    .references(() => RatingGroupToFestivalsProd.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ReportGroupTypeLocalesSleepProd = pgTable(
  "report_group_type_locales_sleep",
  {
    id: serial("id").primaryKey(),
    reportTypeCategoryId: integer("report_type_category_id")
      .references(() => ReportTypeCategoriesProd.id)
      .notNull(),
    reportGroupToFestivalsId: integer("report_group_to_festivals_id")
      .references(() => RatingGroupToFestivalsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const RatingGroupToFestivalsAnswersProd = pgTable(
  "rating_group_to_festivals_answers",
  {
    id: serial("id").primaryKey(),
    rating: integer("rating").notNull(),
    reportGroupToFestivalsId: integer("report_group_to_festivals_id")
      .references(() => RatingGroupToFestivalsProd.id)
      .notNull(),
    ratingQuestionId: integer("rating_question_id")
      .references(() => RatingQuestionsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const RatingGroupAnswersLangProd = pgTable(
  "rating_group_to_festivals_answers_lang",
  {
    id: serial("id").primaryKey(),
    comment: text("comment"),
    lang: integer("lang")
      .references(() => LanguagesProd.id)
      .notNull(),
    ratingGroupToFestivalsAnswersId: integer(
      "rating_group_to_festivals_answers_id"
    )
      .references(() => RatingGroupToFestivalsAnswersProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const RatingGroupResultsLangProd = pgTable("rating_group_results_lang", {
  id: serial("id").primaryKey(),
  comment: text("comment"),
  lang: integer("lang")
    .references(() => LanguagesProd.id)
    .notNull(),
  reportGroupToFestivalsId: integer("report_group_to_festivals_id")
    .references(() => RatingGroupToFestivalsProd.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Activities */

export const typeActivity = pgEnum("type_activity", [
  "Conference",
  "Workshop",
  "Seminar",
  "Congress",
  "National Festival",
]);

export const modalityActivity = pgEnum("modality_activity", [
  "In Person",
  "Online",
]);

export const lengthActivity = pgEnum("length_activity", ["Hours", "Days"]);

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name"),
  type: typeActivity("type"),
  modality: modalityActivity("modality"),
  length: lengthActivity("length"),
  lengthSize: integer("length_size"),
  performerSize: integer("performer_size"),
  reportNationalSectionId: integer("report_national_section_id").references(
    () => ReportNsProd.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  lang: integer("lang").references(() => LanguagesProd.id),
  template: text("template").notNull(),
  tag: text("tag"),
});

/* Relations */

export const userRelations = relations(UsersProd, ({ one }) => ({
  role: one(RolesProd, {
    fields: [UsersProd.roleId],
    references: [RolesProd.id],
  }),
}));

export const festivalRelations = relations(FestivalsProd, ({ many, one }) => ({
  festivalsToCategories: many(FestivalToCategoriesProd),
  country: one(CountriesProd, {
    fields: [FestivalsProd.countryId],
    references: [CountriesProd.id],
  }),
  ns: one(NationalSectionsProd, {
    fields: [FestivalsProd.nsId],
    references: [NationalSectionsProd.id],
  }),
  status: one(StatusesProd, {
    fields: [FestivalsProd.statusId],
    references: [StatusesProd.id],
  }),
  langs: many(FestivalsLangProd),
  owners: many(OwnersProd),
  events: many(EventsProd),
}));

export const festivalLangRelations = relations(
  FestivalsLangProd,
  ({ one }) => ({
    festival: one(FestivalsProd, {
      fields: [FestivalsLangProd.festivalId],
      references: [FestivalsProd.id],
    }),
    l: one(LanguagesProd, {
      fields: [FestivalsLangProd.lang],
      references: [LanguagesProd.id],
    }),
  })
);

export const categoriesRelations = relations(
  CategoriesProd,
  ({ many, one }) => ({
    festivalsToCategories: many(FestivalToCategoriesProd),
    categoryGroup: one(CategoryGroupsProd, {
      fields: [CategoriesProd.categoryGroupId],
      references: [CategoryGroupsProd.id],
    }),
    langs: many(CategoriesLangProd),
  })
);

export const categoriesLangRelations = relations(
  CategoriesLangProd,
  ({ one }) => ({
    category: one(CategoriesProd, {
      fields: [CategoriesLangProd.categoryId],
      references: [CategoriesProd.id],
    }),
    l: one(LanguagesProd, {
      fields: [CategoriesLangProd.lang],
      references: [LanguagesProd.id],
    }),
  })
);

export const categoryGroupsRealtions = relations(
  CategoryGroupsProd,
  ({ many }) => ({
    categories: many(CategoriesProd),
  })
);

export const countriesRelations = relations(CountriesProd, ({ many }) => ({
  festivals: many(FestivalsProd),
}));

export const festivalsToCategoriesRelations = relations(
  FestivalToCategoriesProd,
  ({ one }) => ({
    festival: one(FestivalsProd, {
      fields: [FestivalToCategoriesProd.festivalId],
      references: [FestivalsProd.id],
    }),
    category: one(CategoriesProd, {
      fields: [FestivalToCategoriesProd.categoryId],
      references: [CategoriesProd.id],
    }),
  })
);

export const groupsRelations = relations(GroupsProd, ({ one, many }) => ({
  country: one(CountriesProd, {
    fields: [GroupsProd.countryId],
    references: [CountriesProd.id],
  }),
  directorPhoto: one(StorageProd, {
    fields: [GroupsProd.generalDirectorPhotoId],
    references: [StorageProd.id],
  }),
  ns: one(NationalSectionsProd, {
    fields: [GroupsProd.nsId],
    references: [NationalSectionsProd.id],
  }),
  langs: many(GroupsLangProd),
  owners: many(OwnersProd),
}));

export const groupLangRelations = relations(GroupsLangProd, ({ one }) => ({
  group: one(GroupsProd, {
    fields: [GroupsLangProd.groupId],
    references: [GroupsProd.id],
  }),
  l: one(LanguagesProd, {
    fields: [GroupsLangProd.lang],
    references: [LanguagesProd.id],
  }),
}));

export const nationalSectionRelations = relations(
  NationalSectionsProd,
  ({ many, one }) => ({
    langs: many(NationalSectionsLangProd),
    owners: many(OwnersProd),
    positions: many(NationalSectionsPositionsProd),
    social: one(SocialMediaLinksProd, {
      fields: [NationalSectionsProd.socialMediaLinksId],
      references: [SocialMediaLinksProd.id],
    }),
    festivals: many(FestivalsProd),
    groups: many(GroupsProd),
    otherEvents: many(EventsProd),
  })
);

export const nationalSectionLangRelations = relations(
  NationalSectionsLangProd,
  ({ one }) => ({
    ns: one(NationalSectionsProd, {
      fields: [NationalSectionsLangProd.nsId],
      references: [NationalSectionsProd.id],
    }),
    l: one(LanguagesProd, {
      fields: [NationalSectionsLangProd.lang],
      references: [LanguagesProd.id],
    }),
  })
);

export const nationalSectionPositionRelations = relations(
  NationalSectionsPositionsProd,
  ({ one, many }) => ({
    ns: one(NationalSectionsProd, {
      fields: [NationalSectionsPositionsProd.nsId],
      references: [NationalSectionsProd.id],
    }),
    langs: many(NationalSectionPositionsLangProd),
  })
);

export const nationalSectionPositionLangRelations = relations(
  NationalSectionPositionsLangProd,
  ({ one }) => ({
    position: one(NationalSectionsPositionsProd, {
      fields: [NationalSectionPositionsLangProd.nsPositionsId],
      references: [NationalSectionsPositionsProd.id],
    }),
    l: one(LanguagesProd, {
      fields: [NationalSectionPositionsLangProd.lang],
      references: [LanguagesProd.id],
    }),
  })
);

export const ownerRelations = relations(OwnersProd, ({ one }) => ({
  user: one(UsersProd, {
    fields: [OwnersProd.userId],
    references: [UsersProd.id],
  }),
  festival: one(FestivalsProd, {
    fields: [OwnersProd.festivalId],
    references: [FestivalsProd.id],
  }),
  group: one(GroupsProd, {
    fields: [OwnersProd.groupId],
    references: [GroupsProd.id],
  }),
  ns: one(NationalSectionsProd, {
    fields: [OwnersProd.nsId],
    references: [NationalSectionsProd.id],
  }),
}));

export const socialMediaLinkRelations = relations(
  SocialMediaLinksProd,
  ({ many }) => ({
    others: many(OtherSociaMediaLinksProd),
  })
);

export const otherSocialMediaLinkRelations = relations(
  OtherSociaMediaLinksProd,
  ({ one }) => ({
    mainSocial: one(SocialMediaLinksProd, {
      fields: [OtherSociaMediaLinksProd.socialMediaLinkId],
      references: [SocialMediaLinksProd.id],
    }),
  })
);

export const eventRelations = relations(EventsProd, ({ one, many }) => ({
  ns: one(NationalSectionsProd, {
    fields: [EventsProd.nsId],
    references: [NationalSectionsProd.id],
  }),
  festival: one(FestivalsProd, {
    fields: [EventsProd.festivalId],
    references: [FestivalsProd.id],
  }),
  langs: many(EventsLangProd),
}));

export const eventLangRelations = relations(EventsLangProd, ({ one }) => ({
  event: one(EventsProd, {
    fields: [EventsLangProd.eventId],
    references: [EventsProd.id],
  }),
  l: one(LanguagesProd, {
    fields: [EventsLangProd.lang],
    references: [LanguagesProd.id],
  }),
}));

export const statusRelations = relations(StatusesProd, ({ many }) => ({
  festivals: many(FestivalsProd),
}));

/* Schema Zod  */

export const inserUserSchema = createInsertSchema(UsersProd, {
  email: (schema) => schema.email.email(),
  password: (schema) => schema.password.min(6),
});

export const selectUserSchema = createSelectSchema(UsersProd);

export const requestAuthSchema = inserUserSchema.pick({
  email: true,
  password: true,
});

export const accountFieldsSchema = inserUserSchema.pick({
  firstname: true,
  lastname: true,
  email: true,
});

export const insertEventSchema = createInsertSchema(EventsProd);

export const selectEventSchema = createSelectSchema(EventsProd);

export const insertEventLangSchema = createInsertSchema(EventsLangProd, {
  name: (schema) => schema.name.min(1),
  description: (schema) =>
    schema.description.min(1).refine(
      (value) => {
        return value.split(" ").length <= 200;
      },
      {
        message: "Description can't be more than 200 words",
      }
    ),
});

export const insertFestivalSchema = createInsertSchema(FestivalsProd, {
  email: (schema) => schema.email.min(1).email(),
  directorName: (schema) => schema.directorName.min(1),
  contact: (schema) => schema.contact.min(1),
  location: (schema) => schema.location.min(1),
  phone: (schema) =>
    schema.phone.min(1).refine(
      (value) => {
        return isPossiblePhoneNumber(value || "");
      },
      { params: { i18n: "invalid_phone_number" } }
    ),
});

export const insertFestivalLangSchema = createInsertSchema(FestivalsLangProd, {
  name: (schema) => schema.name.min(1),
  description: (schema) =>
    schema.description.min(1).refine(
      (value) => {
        return value.split(" ").length <= 500;
      },
      {
        message: "Description can't be more than 500 words",
      }
    ),
});

export const inserFestivalByNSSchema = insertFestivalSchema.pick({
  id: true,
  email: true,
});

export const insertGroupSchema = createInsertSchema(GroupsProd, {
  generalDirectorName: (schema) => schema.generalDirectorName.min(1),
  artisticDirectorName: (schema) => schema.generalDirectorName.min(1),
});

export const insertGroupByNSSchema = insertGroupSchema.pick({
  id: true,
});

export const insertGroupLangSchema = createInsertSchema(GroupsLangProd, {
  name: (schema) => schema.name.min(1),
  generalDirectorProfile: (schema) => schema.name.min(1),
  artisticDirectorProfile: (schema) => schema.name.min(1),
});

export const selectFestivalSchema = createSelectSchema(FestivalsProd);

export const insertReportNationalSectionsSchema = createInsertSchema(
  ReportNsLangProd, // TODO hice cambio de una tabla a otra
  {
    workDescription: (schema) =>
      schema.workDescription.min(1).refine(
        (value) => {
          return value.split(" ").length <= 500;
        },
        {
          message: "Description can't be more than 500 words",
        }
      ),
  }
);

export const insertNationalSectionSchema =
  createInsertSchema(NationalSectionProd);

export const inserNationalSectionLangSchema = createInsertSchema(
  NationalSectionsLangProd,
  {
    name: (schema) => schema.name.min(1),
    about: (schema) => schema.about.min(1),
  }
);
export const insertNationalSectionPositionsSchema = createInsertSchema(
  NationalSectionsPositionsProd,
  {
    name: (schema) => schema.name.min(1),
    email: (schema) => schema.email.min(1),
    phone: (schema) =>
      schema.phone.min(1).refine(
        (value) => {
          return isPossiblePhoneNumber(value || "");
        },
        { params: { i18n: "invalid_phone_number" } }
      ),
  }
);

export const insertNationalSectionPositionsLangSchema = createInsertSchema(
  NationalSectionPositionsLangProd,
  {
    shortBio: (schema) =>
      schema.shortBio.min(1).refine(
        (value) => {
          return value.split(" ").length <= 200;
        },
        {
          message: "Description can't be more than 200 words",
        }
      ),
  }
);

export const insertActivitySchema = createInsertSchema(activities, {
  name: (schema) => schema.name.min(1),
});

export const insertSocialMediaLinkSchema = createInsertSchema(
  SocialMediaLinksProd,
  {
    instagramLink: (schema) => schema.instagramLink.url(),
    facebookLink: (schema) => schema.facebookLink.url(),
    websiteLink: (schema) => schema.websiteLink.url(),
  }
);

/* Infered Types */

export type InsertUser = typeof UsersProd.$inferInsert;
export type SelectUser = typeof UsersProd.$inferSelect;

export type InsertEvent = typeof EventsProd.$inferInsert;
export type SelectEvent = typeof EventsProd.$inferSelect;

export type InsertEventLang = typeof EventsLangProd.$inferInsert;
export type SelectEventLang = typeof EventsLangProd.$inferSelect;

export type InsertCategory = typeof CategoriesProd.$inferInsert;
export type SelectCategory = typeof CategoriesProd.$inferSelect;

export type InsertFestival = typeof FestivalsProd.$inferInsert;
export type SelectFestival = typeof FestivalsProd.$inferSelect;

export type InsertFestivalLang = typeof FestivalsLangProd.$inferInsert;
export type SelectFestivalLang = typeof FestivalsLangProd.$inferSelect;

export type InsertGroup = typeof GroupsProd.$inferInsert;
export type SelectGroup = typeof GroupsProd.$inferSelect;

export type InsertCountries = typeof CountriesProd.$inferInsert;
export type SelectCountries = typeof CountriesProd.$inferSelect;

export type InsertLanguages = typeof LanguagesProd.$inferInsert;
export type SelectLanguages = typeof LanguagesProd.$inferSelect;

export type InsertRoles = typeof RolesProd.$inferInsert;
export type SelectRoles = typeof RolesProd.$inferSelect;

export type InsertPermissions = typeof PermissionsProd.$inferInsert;
export type SelectPermissions = typeof PermissionsProd.$inferSelect;

export type InsertRolesToPermissions =
  typeof RolesToPermissionsProd.$inferInsert;
export type SelectRolesToPermissions =
  typeof RolesToPermissionsProd.$inferSelect;

export type InsertFestivalToCategories =
  typeof FestivalToCategoriesProd.$inferInsert;
export type SelectFestivalToCategories =
  typeof FestivalToCategoriesProd.$inferSelect;

export type InsertStatus = typeof StatusesProd.$inferInsert;
export type SelectStatus = typeof StatusesProd.$inferSelect;

export type InsertNationalSection = typeof NationalSectionsProd.$inferInsert;
export type SelectNationalSection = typeof NationalSectionsProd.$inferSelect;

export type InsertNationalSectionLang =
  typeof NationalSectionsLangProd.$inferInsert;
export type SelectNationalSectionLang =
  typeof NationalSectionsLangProd.$inferSelect;

export type InsertNationalSectionPositions =
  typeof NationalSectionsPositionsProd.$inferInsert;
export type SelectNationalSectionPositions =
  typeof NationalSectionsPositionsProd.$inferSelect;

export type InsertNationalSectionPositionsLang =
  typeof NationalSectionPositionsLangProd.$inferInsert;
export type SelectNationalSectionPositionsLang =
  typeof NationalSectionPositionsLangProd.$inferSelect;
