import { InferModel, relations, SQL, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { AdapterAccountType } from "next-auth/adapters";
import { isPossiblePhoneNumber } from "libphonenumber-js";

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

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const rolesToPermissions = pgTable("roles_to_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => roles.id),
  permissionId: integer("permission_id").references(() => permissions.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: langCodeEnum("code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const regionsLang = pgTable("regions_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  regionId: integer("region_id").references(() => regions.id),
  lang: integer("lang_id").references(() => languages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  lat: text("lat"),
  lng: text("lng"),
  regionId: integer("region_id").references(() => regions.id),
  nativeLang: integer("native_lang").references(() => languages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const countriesLang = pgTable("countries_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lang: integer("lang").references(() => languages.id),
  countryId: integer("country_id").references(() => countries.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const statuses = pgTable("statuses", {
  id: serial("id").primaryKey(),
  name: text("name"),
  slug: text("slug"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const statusesLang = pgTable("statuses_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  statusId: integer("status_id").references(() => statuses.id),
  lang: integer("lang_id").references(() => languages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const components = pgTable("components", {
  id: serial("id").primaryKey(),
  name: text("name"),
  slug: text("slug"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const componentsLang = pgTable("components_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  componentId: integer("component_id").references(() => components.id),
  lang: integer("lang_id").references(() => languages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const storages = pgTable("storage", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  name: text("name"),
  aux: text("aux"),
  keywords: text("keywords"),
  lang: integer("lang").references(() => languages.id),
  isFile: boolean("is_file").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const users = pgTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roleId: integer("role_id").references(() => roles.id),
    countryId: integer("country_id").references(() => countries.id),
    title: text("title"),
    name: text("name"),
    firstname: text("firstname"),
    lastname: text("lastname"),
    email: text("email").notNull().unique(),
    address: text("address"),
    city: text("city"),
    zip: text("zip"),
    phone: text("phone"),
    image: text("image"),
    // image: integer("image_id").references(() => storages.id),
    password: text("password"),
    active: boolean("active").default(false),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    photoId: integer("image_id").references(() => storages.id),
    isCreationNotified: boolean("is_creation_notified").default(false),
    // stripeCustomerId: text("stripe_customer_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    emailUniqueIndex: uniqueIndex("emailUniqueIndex").on(lower(table.email)),
  })
);
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
export const verificationTokens = pgTable(
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
export const sessionsContainer = pgTable("session_group", {
  id: serial("id").primaryKey(),
});
export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
export const socialMediaLinks = pgTable("social_media_links", {
  id: serial("id").primaryKey(),
  facebookLink: text("facebook_link"),
  instagramLink: text("instagram_link"),
  websiteLink: text("website_link"),
  youtubeLink: text("youtube_link"),
  tiktokLink: text("tiktok_link"),
  xLink: text("x_link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const otherSociaMediaLinks = pgTable("other_social_media_links", {
  id: serial("id").primaryKey(),
  name: text("name"),
  link: text("link"),
  socialMediaLinkId: integer("social_media_link_id").references(
    () => socialMediaLinks.id
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

export const typeNationalSections = pgTable("type_national_section", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const typeNationalSectionsLang = pgTable("type_national_section_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lang: integer("lang").references(() => languages.id),
  typeNationalSectionId: integer("type_national_section_id").references(
    () => typeNationalSections.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const nationalSections = pgTable("national_section", {
  id: serial("id").primaryKey(),
  published: boolean("published").default(false),
  slug: text("slug").notNull(),
  socialMediaLinksId: integer("socia_media_links_id").references(
    () => socialMediaLinks.id,
    { onDelete: "set null" }
  ),
  typeNationalSectionId: integer("type_national_section_id").references(
    () => typeNationalSections.id
  ),
  countryId: integer("country_id").references(() => countries.id),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const nationalSectionsLang = pgTable("national_section_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  about: text("about"),
  lang: integer("lang").references(() => languages.id),
  nsId: integer("ns_id").references(() => nationalSections.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const typePosition = pgTable("type_positions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const typePositionLang = pgTable("type_positions_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  typePositionId: integer("type_position_id").references(() => typePosition.id),
  lang: integer("lang_id").references(() => languages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const nationalSectionsPositions = pgTable("national_section_positions", {
  id: serial("id").primaryKey(),
  title: text("title"),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  birthDate: date("birth_date", { mode: "date" }),
  deadDate: date("dead_date", { mode: "date" }),
  isHonorable: boolean("is_honorable").default(false),
  photoId: integer("photo_id").references(() => storages.id),
  typePositionId: integer("type_position_id").references(() => typePosition.id),
  nsId: integer("ns_id").references(() => nationalSections.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const nationalSectionPositionsLang = pgTable(
  "national_section_positions_lang",
  {
    id: serial("id").primaryKey(),
    shortBio: text("short_bio").notNull(),
    otherMemberName: text("other_member_name"),
    lang: integer("lang").references(() => languages.id),
    nsPositionsId: integer("ns_positions_id").references(
      () => nationalSectionsPositions.id
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

export const categoryGroups = pgTable("category_groups", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  categoryGroupId: integer("category_group_id").references(
    () => categoryGroups.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const categoriesLang = pgTable("categories_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  caption: text("caption"),
  lang: integer("lang").references(() => languages.id),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const festivals = pgTable("festivals", {
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
  linkConditions: text("link_conditions"),
  statusId: integer("status_id").references(() => statuses.id),
  nsId: integer("ns_id").references(() => nationalSections.id),
  certificationMemberId: integer("certification_member_id").references(
    () => storages.id
  ),
  socialMediaLinksId: integer("socia_media_links_id").references(
    () => socialMediaLinks.id,
    { onDelete: "set null" }
  ),
  regionForGroupsId: integer("region_for_groups").references(() => regions.id),
  countryId: integer("country_id").references(() => countries.id),
  logoId: integer("logo_id").references(() => storages.id),
  coverId: integer("cover_id").references(() => storages.id),
  accomodationPhotoId: integer("accomodation_id").references(() => storages.id),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const transportLocations = pgTable("transport_locations", {
  id: serial("id").primaryKey(),
  location: text("location"),
  lat: text("lat"),
  lng: text("lng"),
  festivalId: integer("festival_id").references(() => festivals.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const festivalsLang = pgTable("festivals_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  description: text("description").default(""),
  address: text("address"),
  otherTranslatorLanguage: text("other_translator_language"),
  lang: integer("lang").references(() => languages.id),
  festivalId: integer("festival_id").references(() => festivals.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const festivalPhotos = pgTable("festival_photos", {
  id: serial("id").primaryKey(),
  festivalId: integer("festival_id").references(() => festivals.id),
  photoId: integer("photo_id").references(() => storages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const festivalStagePhotos = pgTable("festival_stage_photos", {
  id: serial("id").primaryKey(),
  festivalId: integer("festival_id").references(() => festivals.id),
  photoId: integer("photo_id").references(() => storages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const festivalToCategories = pgTable(
  "festival_to_categories",
  {
    festivalId: integer("festival_id").references(() => festivals.id),
    categoryId: integer("category_id").references(() => categories.id),
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
    festivalId: integer("festival_id").references(() => festivals.id),
    statusId: integer("status_id").references(() => statuses.id),
    question: text("question"),
    answer: text("text"),
    recognizedSince: text("recognized_since"),
    recognizedRange: text("recognized_range"),
    typeOfCompensation: text("type_of_compensation"),
    financialCompensation: text("financial_compensation"),
    inKindCompensation: text("in_kind_compnesation"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.festivalId, t.statusId] }),
  })
);
export const festivalsToComponents = pgTable(
  "festival_to_components",
  {
    festivalId: integer("festival_id").references(() => festivals.id),
    componentId: integer("component_id").references(() => components.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.festivalId, t.componentId] }),
  })
);

export const festivalsGroupToRegions = pgTable(
  "festival_group_to_regions",
  {
    festivalId: integer("festival_id").references(() => festivals.id),
    regionId: integer("region_id").references(() => regions.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.festivalId, t.regionId] }),
  })
);
export const festivalsToConnected = pgTable("festival_to_connected", {
  id: serial("id").primaryKey(),
  sourceFestivalId: integer("source_festival_id").references(
    () => festivals.id
  ),
  targetFestivalId: integer("target_component_id").references(
    () => festivals.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const festivalsToGroups = pgTable("festival_to_groups", {
  id: serial("id").primaryKey(),
  festivalId: integer("festival_id").references(() => festivals.id),
  groupId: integer("group_id").references(() => groups.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().default(""),
  // name: text("name").notNull(),
  // icon: text("icon"),
  categoryGroupId: integer("category_group_id").references(
    () => categoryGroups.id
  ),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  festivalId: integer("festival_id").references(() => festivals.id),
  nsId: integer("ns_id").references(() => nationalSections.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const eventsLang = pgTable("events_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  lang: integer("lang").references(() => languages.id),
  eventId: integer("event_id").references(() => events.id),
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

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  generalDirectorName: text("general_director_name"),
  generalDirectorPhoto: text("general_director_photo"),
  artisticDirectorName: text("artistic_director_name"),
  artisticDirectorPhoto: text("artistic_director_photo"),
  musicalDirectorName: text("musical_director_name"),
  musicalDirectorPhoto: text("musical_director_photo"),
  coverPhotoId: integer("cover_photo_id").references(() => storages.id),
  logoId: integer("logo_id").references(() => storages.id),
  facebookLink: text("facebook_link"),
  instagramLink: text("instagram_link"),
  websiteLink: text("website_link"),
  youtubeId: text("youtube_id"),
  isAbleTravel: boolean("is_able_travel").default(false),
  isAbleTravelLiveMusic: boolean("is_able_travel_live_music").default(false),
  specificTravelDateFrom: date("specific_start_date", {
    mode: "date",
  }),
  specificTravelDateTo: date("specific_end_date", {
    mode: "date",
  }),
  specificRegion: integer("region_id").references(() => regions.id),
  membersNumber: integer("members_number"),
  phone: text("phone"),
  generalDirectorPhotoId: integer("general_director_photo_id").references(
    () => storages.id
  ),
  artisticDirectorPhotoId: integer("artistic_director_photo_id").references(
    () => storages.id
  ),
  musicalDirectorPhotoId: integer("musical_director_photo_id").references(
    () => storages.id
  ),
  linkPortfolio: text("link_portfolio"),
  nsId: integer("ns_id").references(() => nationalSections.id),
  countryId: integer("country_id").references(() => countries.id),
  certificationMemberId: integer("certification_member_id").references(
    () => storages.id
  ),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const groupsLang = pgTable("groups_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  address: text("address"),
  generalDirectorProfile: text("general_director_profile"),
  artisticDirectorProfile: text("artistic_director_profile"),
  musicalDirectorProfile: text("musical_director_profile"),
  lang: integer("lang").references(() => languages.id),
  groupId: integer("group_id").references(() => groups.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const eventsToGroups = pgTable("events_to_groups", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  groupId: integer("group_id").references(() => groups.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const groupToCategories = pgTable(
  "group_to_categories",
  {
    groupId: integer("group_id").references(() => groups.id),
    categoryId: integer("category_id").references(() => categories.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.categoryId] }),
  })
);
export const subgroups = pgTable("subgroups", {
  id: serial("id").primaryKey(),
  membersNumber: integer("members_number"),
  hasAnotherContact: boolean("has_another_contact").default(false),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactMail: text("contact_mail"),
  groupId: integer("group_id").references(() => groups.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const subgroupsLang = pgTable("subgroups_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  contactAddress: text("contact_address"),
  subgroupId: integer("subgroup_id").references(() => subgroups.id),
  lang: integer("lang").references(() => languages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const subgroupToCategories = pgTable(
  "subgroup_to_categories",
  {
    subgroupId: integer("subgroup_id").references(() => subgroups.id),
    categoryId: integer("category_id").references(() => categories.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.subgroupId, t.categoryId] }),
  })
);
export const groupPhotos = pgTable("group_photos", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id),
  photoId: integer("photo_id").references(() => storages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const repertories = pgTable("repertories", {
  id: serial("id").primaryKey(),
  gallery: text("gallery"),
  youtubeId: text("youtube_id"),
  groupId: integer("group_id").references(() => groups.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const repertoriesLang = pgTable("repertories_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  repertoryId: integer("repertory_id").references(() => repertories.id),
  lang: integer("lang").references(() => languages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/*
8. TIMELINE
Timeline

9. WEBSITE MODULE
Design
Menu
Menu Lang

10. Announcements
Announcements
Announcements files
*/

export const timeline = pgTable("timeline", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  sections: json("sections"),
  lang: integer("lang").references(() => languages.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const design = pgTable("design", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  lang: integer("lang")
    .references(() => languages.id, { onDelete: "set null" })
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const menu = pgTable("menu", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const menuLang = pgTable("menu_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lang: integer("lang")
    .notNull()
    .references(() => languages.id),
  menuId: integer("menu_id")
    .notNull()
    .references(() => menu.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  to: text("to").notNull(),
  from: text("from").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  categoryNames: text("category_names"),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const announcementsFiles = pgTable("announcements_files", {
  id: serial("id").primaryKey(),
  announcementId: integer("announcement_id").references(() => announcements.id),
  mediaId: integer("media_id").references(() => storages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/*
11. PAGES
Sub Pages
Sub Pages Docs
Sub Pages Texts Lang
news
*/

export const SubPagesProd = pgTable("sub_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  countryId: integer("country_id").references(() => countries.id),
  socialMediaLinksId: integer("socia_media_links_id").references(
    () => socialMediaLinks.id,
    { onDelete: "set null" }
  ),
  url: text("url").notNull(),
  isNews: boolean("is_news").default(false),
  originalDate: timestamp("original_date", { mode: "date" }).notNull(),
  published: boolean("published").default(false),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  mainImage: text("main_image"),
});
export const SubPagesTextsLangProd = pgTable("sub_pages_texts_lang", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  lang: integer("lang").references(() => languages.id),
  sections: json("sections"),
  subPageId: integer("subpage_id").references(() => SubPagesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 12. Owers */

export const owners = pgTable("owners", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  festivalId: integer("festival_id").references(() => festivals.id),
  groupId: integer("group_id").references(() => groups.id),
  nsId: integer("ns_id").references(() => nationalSections.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 13. Type Reports */

export const reportTypeCategories = pgTable("report_type_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  oriented_to: text("oriented_to"),
  subType: text("subType"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const reportTypeCategoriesNsLang = pgTable(
  "report_type_categories_lang",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    lang: integer("lang")
      .references(() => languages.id)
      .notNull(),
    reportTypeCategoryId: integer("report_type_category_id")
      .references(() => reportTypeCategories.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

/* 14. Rating Questions */

export const ratingType = pgTable("rating_type", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ratingQuestions = pgTable("rating_questions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  ratingTypeId: integer("rating_type_id").references(() => ratingType.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ratingQuestionsLang = pgTable("rating_questions_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  tooltip: text("tooltip"),
  lang: integer("lang")
    .references(() => languages.id)
    .notNull(),
  ratingQuestionlId: integer("rating_question_id")
    .references(() => ratingQuestions.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 15. NS Reports */

export const reportNationalSections = pgTable("report_ns", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  festivalSize: integer("festival_size"),
  groupSize: integer("group_size"),
  associationSize: integer("association_size"),
  individualMemberSize: integer("individual_memeber_size"),
  activeNationalCommission: boolean("active_national_commission"),
  nsId: integer("ns_id")
    .references(() => nationalSections.id)
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
export const reportNationalSectionsLang = pgTable("report_ns_lang", {
  id: serial("id").primaryKey(),
  title: text("title"),
  comment: text("comment"),
  workDescription: text("work_description"),
  lang: integer("lang")
    .references(() => languages.id)
    .notNull(),
  reportNsId: integer("report_ns_id")
    .references(() => reportNationalSections.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const reportNationalSectionActivities = pgTable("report_ns_activities", {
  id: serial("id").primaryKey(),
  reportTypeCategoryId: integer("report_type_category_id")
    .references(() => reportTypeCategories.id)
    .notNull(),
  reportNsId: integer("report_ns_id")
    .references(() => reportNationalSections.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 16. Festivals Reports */

export const reportFestival = pgTable("report_festival", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  festivalId: integer("festival_id")
    .references(() => festivals.id)
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
export const reportFestivalActivities = pgTable("report_festival_activities", {
  id: serial("id").primaryKey(),
  reportTypeCategoryId: integer("report_type_category_id")
    .references(() => reportTypeCategories.id)
    .notNull(),
  reportFestivalId: integer("report_festival_id")
    .references(() => reportFestival.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 17. Festival Rating */

export const ratingFestivalToGroups = pgTable("rating_festival_to_groups", {
  id: serial("id").primaryKey(),
  ratingResult: integer("rating_result").notNull(),
  reportFestivalId: integer("report_festival_id")
    .references(() => reportFestival.id)
    .notNull(),
  groupId: integer("group_id").references(() => groups.id),
  nameNoCioffGroup: text("name_no_cioff_group"),
  amountPersonsGroup: integer("amount_persons_group"),
  isInvitationPerWebsite: boolean("is_invitation_per_website"),
  isInvitationPerNs: boolean("is_invitation_per_ns"),
  isGroupLiveMusic: boolean("is_group_live_music"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ratingFestivalToGroupsAnswers = pgTable(
  "rating_festival_to_groups_answers",
  {
    id: serial("id").primaryKey(),
    rating: integer("rating").notNull(),
    ratingFestivalToGroupsId: integer("rating_festival_to_groups_id")
      .references(() => ratingFestivalToGroups.id)
      .notNull(),
    ratingQuestionId: integer("rating_question_id")
      .references(() => ratingQuestions.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const ratingFestivalToGroupsAnswersLang = pgTable(
  "rating_festival_to_groups_answers_lang",
  {
    id: serial("id").primaryKey(),
    comment: text("comment"),
    lang: integer("lang")
      .references(() => languages.id)
      .notNull(),
    ratingFestivalToGroupsAnswersId: integer(
      "rating_festival_to_groups_answers_id"
    )
      .references(() => ratingFestivalToGroupsAnswers.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const ratingFestivalResultsLangProd = pgTable(
  "rating_festival_results_lang",
  {
    id: serial("id").primaryKey(),
    comment: text("comment"),
    lang: integer("lang")
      .references(() => languages.id)
      .notNull(),
    ratingFestivalToGroupsId: integer("rating_festival_to_groups_id")
      .references(() => ratingFestivalToGroups.id)
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
    .references(() => groups.id)
    .notNull(),
  amountPersonsTravelled: integer("amount_persons_travelled"),
  ich: text("ich"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 19. Group Rating */

export const ratingGroupToFestivals = pgTable("rating_group_to_festivals", {
  id: serial("id").primaryKey(),
  ratingResult: integer("rating_result").notNull(),
  reportGroupId: integer("report_group_id")
    .references(() => ReportGroupProd.id)
    .notNull(),
  festivalId: integer("festival_id").references(() => festivals.id),
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
export const reportGroupTypeLocales = pgTable("report_group_type_locales", {
  id: serial("id").primaryKey(),
  reportTypeCategoryId: integer("report_type_category_id")
    .references(() => reportTypeCategories.id)
    .notNull(),
  reportGroupToFestivalsId: integer("report_group_to_festivals_id")
    .references(() => ratingGroupToFestivals.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const reportGroupTypeLocalesSleep = pgTable(
  "report_group_type_locales_sleep",
  {
    id: serial("id").primaryKey(),
    reportTypeCategoryId: integer("report_type_category_id")
      .references(() => reportTypeCategories.id)
      .notNull(),
    reportGroupToFestivalsId: integer("report_group_to_festivals_id")
      .references(() => ratingGroupToFestivals.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const ratingGroupToFestivalsAnswers = pgTable(
  "rating_group_to_festivals_answers",
  {
    id: serial("id").primaryKey(),
    rating: integer("rating").notNull(),
    reportGroupToFestivalsId: integer("report_group_to_festivals_id")
      .references(() => ratingGroupToFestivals.id)
      .notNull(),
    ratingQuestionId: integer("rating_question_id")
      .references(() => ratingQuestions.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const ratingGroupAnswersLang = pgTable(
  "rating_group_to_festivals_answers_lang",
  {
    id: serial("id").primaryKey(),
    comment: text("comment"),
    lang: integer("lang")
      .references(() => languages.id)
      .notNull(),
    ratingGroupToFestivalsAnswersId: integer(
      "rating_group_to_festivals_answers_id"
    )
      .references(() => ratingGroupToFestivalsAnswers.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const ratingGroupResultsLang = pgTable("rating_group_results_lang", {
  id: serial("id").primaryKey(),
  comment: text("comment"),
  lang: integer("lang")
    .references(() => languages.id)
    .notNull(),
  reportGroupToFestivalsId: integer("report_group_to_festivals_id")
    .references(() => ratingGroupToFestivals.id)
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
    () => reportNationalSections.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  lang: integer("lang").references(() => languages.id),
  template: text("template").notNull(),
  subject: text("subject"),
  tag: text("tag"),
});

export const videoTutorialLinks = pgTable("video_tutorial_links", {
  id: serial("id").primaryKey(),
  lang: integer("lang").references(() => languages.id),
  role: integer("role").references(() => roles.id),
  link: text("link").notNull(),
  tag: text("tag"),
});

/* Relations */

export const userRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  country: one(countries, {
    fields: [users.countryId],
    references: [countries.id],
  }),
}));

export const festivalRelations = relations(festivals, ({ many, one }) => ({
  festivalsToCategories: many(festivalToCategories),
  festivalsToStatuses: many(festivalsToStatuses),
  festivalsToComponents: many(festivalsToComponents),
  festivalsGroupToRegions: many(festivalsGroupToRegions),
  festivalsToGroups: many(festivalsToGroups),
  connections: many(festivalsToConnected, { relationName: "source" }),
  target: many(festivalsToConnected, { relationName: "target" }),
  photos: many(festivalPhotos),
  stagePhotos: many(festivalStagePhotos),
  country: one(countries, {
    fields: [festivals.countryId],
    references: [countries.id],
  }),
  ns: one(nationalSections, {
    fields: [festivals.nsId],
    references: [nationalSections.id],
  }),
  status: one(statuses, {
    fields: [festivals.statusId],
    references: [statuses.id],
  }),
  social: one(socialMediaLinks, {
    fields: [festivals.socialMediaLinksId],
    references: [socialMediaLinks.id],
  }),
  transports: many(transportLocations),
  langs: many(festivalsLang),
  owners: many(owners),
  events: many(events),
  coverPhoto: one(storages, {
    fields: [festivals.coverId],
    references: [storages.id],
  }),
  logo: one(storages, {
    fields: [festivals.logoId],
    references: [storages.id],
  }),
  accomodationPhoto: one(storages, {
    fields: [festivals.accomodationPhotoId],
    references: [storages.id],
  }),
  certification: one(storages, {
    fields: [festivals.logoId],
    references: [storages.id],
  }),
}));

export const transportLocationRelations = relations(
  transportLocations,
  ({ one }) => ({
    festival: one(festivals, {
      fields: [transportLocations.festivalId],
      references: [festivals.id],
    }),
  })
);

export const festivalLangRelations = relations(festivalsLang, ({ one }) => ({
  festival: one(festivals, {
    fields: [festivalsLang.festivalId],
    references: [festivals.id],
  }),
  l: one(languages, {
    fields: [festivalsLang.lang],
    references: [languages.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  festivalsToCategories: many(festivalToCategories),
  categoryGroup: one(categoryGroups, {
    fields: [categories.categoryGroupId],
    references: [categoryGroups.id],
  }),
  langs: many(categoriesLang),
}));

export const categoriesLangRelations = relations(categoriesLang, ({ one }) => ({
  category: one(categories, {
    fields: [categoriesLang.categoryId],
    references: [categories.id],
  }),
  l: one(languages, {
    fields: [categoriesLang.lang],
    references: [languages.id],
  }),
}));

export const categoryGroupsRealtions = relations(
  categoryGroups,
  ({ many }) => ({
    categories: many(categories),
  })
);

export const countriesRelations = relations(countries, ({ one, many }) => ({
  festivals: many(festivals),
  langs: many(countriesLang),
  nativeLang: one(languages, {
    fields: [countries.nativeLang],
    references: [languages.id],
  }),
}));

export const countriesLangRelations = relations(countriesLang, ({ one }) => ({
  country: one(countries, {
    fields: [countriesLang.countryId],
    references: [countries.id],
  }),
  l: one(languages, {
    fields: [countriesLang.lang],
    references: [languages.id],
  }),
}));

export const festivalsToCategoriesRelations = relations(
  festivalToCategories,
  ({ one }) => ({
    festival: one(festivals, {
      fields: [festivalToCategories.festivalId],
      references: [festivals.id],
    }),
    category: one(categories, {
      fields: [festivalToCategories.categoryId],
      references: [categories.id],
    }),
  })
);

export const festivalPhotosRelations = relations(festivalPhotos, ({ one }) => ({
  festival: one(festivals, {
    fields: [festivalPhotos.festivalId],
    references: [festivals.id],
  }),
  photo: one(storages, {
    fields: [festivalPhotos.photoId],
    references: [storages.id],
  }),
}));

export const groupPhotosRelations = relations(groupPhotos, ({ one }) => ({
  group: one(groups, {
    fields: [groupPhotos.groupId],
    references: [groups.id],
  }),
  photo: one(storages, {
    fields: [groupPhotos.photoId],
    references: [storages.id],
  }),
}));

export const festivalStagePhotosRelations = relations(
  festivalStagePhotos,
  ({ one }) => ({
    festival: one(festivals, {
      fields: [festivalStagePhotos.festivalId],
      references: [festivals.id],
    }),
    photo: one(storages, {
      fields: [festivalStagePhotos.photoId],
      references: [storages.id],
    }),
  })
);

export const festivalsToStatusesRelations = relations(
  festivalsToStatuses,
  ({ one }) => ({
    festival: one(festivals, {
      fields: [festivalsToStatuses.festivalId],
      references: [festivals.id],
    }),
    status: one(statuses, {
      fields: [festivalsToStatuses.statusId],
      references: [statuses.id],
    }),
  })
);

export const festivalsToComponentsRelations = relations(
  festivalsToComponents,
  ({ one }) => ({
    festival: one(festivals, {
      fields: [festivalsToComponents.festivalId],
      references: [festivals.id],
    }),
    component: one(components, {
      fields: [festivalsToComponents.componentId],
      references: [components.id],
    }),
  })
);

export const festivalsGroupToRegionsRelations = relations(
  festivalsGroupToRegions,
  ({ one }) => ({
    festival: one(festivals, {
      fields: [festivalsGroupToRegions.festivalId],
      references: [festivals.id],
    }),
    region: one(regions, {
      fields: [festivalsGroupToRegions.regionId],
      references: [regions.id],
    }),
  })
);

export const festivalsToConnectedRelations = relations(
  festivalsToConnected,
  ({ one }) => ({
    source: one(festivals, {
      fields: [festivalsToConnected.sourceFestivalId],
      references: [festivals.id],
      relationName: "source",
    }),
    target: one(festivals, {
      fields: [festivalsToConnected.targetFestivalId],
      references: [festivals.id],
      relationName: "target",
    }),
  })
);

export const festivalsToGroupsRelations = relations(
  festivalsToGroups,
  ({ one }) => ({
    festival: one(festivals, {
      fields: [festivalsToGroups.festivalId],
      references: [festivals.id],
    }),
    group: one(groups, {
      fields: [festivalsToGroups.groupId],
      references: [groups.id],
    }),
  })
);

export const componentRelations = relations(components, ({ many }) => ({
  festivalsToComponents: many(festivalsToComponents),
  langs: many(componentsLang),
}));

export const componentLangRelations = relations(componentsLang, ({ one }) => ({
  component: one(components, {
    fields: [componentsLang.componentId],
    references: [components.id],
  }),
  l: one(languages, {
    fields: [componentsLang.lang],
    references: [languages.id],
  }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  country: one(countries, {
    fields: [groups.countryId],
    references: [countries.id],
  }),
  directorPhoto: one(storages, {
    fields: [groups.generalDirectorPhotoId],
    references: [storages.id],
  }),
  artisticPhoto: one(storages, {
    fields: [groups.artisticDirectorPhotoId],
    references: [storages.id],
  }),
  musicalPhoto: one(storages, {
    fields: [groups.musicalDirectorPhotoId],
    references: [storages.id],
  }),
  ns: one(nationalSections, {
    fields: [groups.nsId],
    references: [nationalSections.id],
  }),
  langs: many(groupsLang),
  owners: many(owners),
  groupToCategories: many(groupToCategories),
  festivalsToGroups: many(festivalsToGroups),
  subgroups: many(subgroups),
  repertories: many(repertories),
  photos: many(groupPhotos),
  coverPhoto: one(storages, {
    fields: [groups.coverPhotoId],
    references: [storages.id],
  }),
  logo: one(storages, {
    fields: [groups.logoId],
    references: [storages.id],
  }),
  specificRegion: one(regions, {
    fields: [groups.specificRegion],
    references: [regions.id],
  }),
}));

export const groupLangRelations = relations(groupsLang, ({ one }) => ({
  group: one(groups, {
    fields: [groupsLang.groupId],
    references: [groups.id],
  }),
  l: one(languages, {
    fields: [groupsLang.lang],
    references: [languages.id],
  }),
}));

export const groupsToCategoriesRelations = relations(
  groupToCategories,
  ({ one }) => ({
    group: one(groups, {
      fields: [groupToCategories.groupId],
      references: [groups.id],
    }),
    category: one(categories, {
      fields: [groupToCategories.categoryId],
      references: [categories.id],
    }),
  })
);

export const nationalSectionRelations = relations(
  nationalSections,
  ({ many, one }) => ({
    langs: many(nationalSectionsLang),
    owners: many(owners),
    positions: many(nationalSectionsPositions),
    social: one(socialMediaLinks, {
      fields: [nationalSections.socialMediaLinksId],
      references: [socialMediaLinks.id],
    }),
    festivals: many(festivals),
    groups: many(groups),
    otherEvents: many(events),
    country: one(countries, {
      fields: [nationalSections.countryId],
      references: [countries.id],
    }),
  })
);

export const nationalSectionLangRelations = relations(
  nationalSectionsLang,
  ({ one }) => ({
    ns: one(nationalSections, {
      fields: [nationalSectionsLang.nsId],
      references: [nationalSections.id],
    }),
    l: one(languages, {
      fields: [nationalSectionsLang.lang],
      references: [languages.id],
    }),
  })
);

export const nationalSectionPositionRelations = relations(
  nationalSectionsPositions,
  ({ one, many }) => ({
    ns: one(nationalSections, {
      fields: [nationalSectionsPositions.nsId],
      references: [nationalSections.id],
    }),
    langs: many(nationalSectionPositionsLang),
    type: one(typePosition, {
      fields: [nationalSectionsPositions.typePositionId],
      references: [typePosition.id],
    }),
    photo: one(storages, {
      fields: [nationalSectionsPositions.photoId],
      references: [storages.id],
    }),
  })
);

export const nationalSectionPositionLangRelations = relations(
  nationalSectionPositionsLang,
  ({ one }) => ({
    position: one(nationalSectionsPositions, {
      fields: [nationalSectionPositionsLang.nsPositionsId],
      references: [nationalSectionsPositions.id],
    }),
    l: one(languages, {
      fields: [nationalSectionPositionsLang.lang],
      references: [languages.id],
    }),
  })
);

export const ownerRelations = relations(owners, ({ one }) => ({
  user: one(users, {
    fields: [owners.userId],
    references: [users.id],
  }),
  festival: one(festivals, {
    fields: [owners.festivalId],
    references: [festivals.id],
  }),
  group: one(groups, {
    fields: [owners.groupId],
    references: [groups.id],
  }),
  ns: one(nationalSections, {
    fields: [owners.nsId],
    references: [nationalSections.id],
  }),
}));

export const socialMediaLinkRelations = relations(
  socialMediaLinks,
  ({ many }) => ({
    others: many(otherSociaMediaLinks),
  })
);

export const otherSocialMediaLinkRelations = relations(
  otherSociaMediaLinks,
  ({ one }) => ({
    mainSocial: one(socialMediaLinks, {
      fields: [otherSociaMediaLinks.socialMediaLinkId],
      references: [socialMediaLinks.id],
    }),
  })
);

export const eventRelations = relations(events, ({ one, many }) => ({
  ns: one(nationalSections, {
    fields: [events.nsId],
    references: [nationalSections.id],
  }),
  festival: one(festivals, {
    fields: [events.festivalId],
    references: [festivals.id],
  }),
  langs: many(eventsLang),
}));

export const eventLangRelations = relations(eventsLang, ({ one }) => ({
  event: one(events, {
    fields: [eventsLang.eventId],
    references: [events.id],
  }),
  l: one(languages, {
    fields: [eventsLang.lang],
    references: [languages.id],
  }),
}));

export const statusRelations = relations(statuses, ({ many }) => ({
  festivals: many(festivals),
  festivalsToStatuses: many(festivalsToStatuses),
}));

export const typePositionRelations = relations(typePosition, ({ many }) => ({
  positions: many(nationalSectionsPositions),
  langs: many(typePositionLang),
}));

export const typePositionLangRelations = relations(
  typePositionLang,
  ({ one }) => ({
    type: one(typePosition, {
      fields: [typePositionLang.typePositionId],
      references: [typePosition.id],
    }),
    l: one(languages, {
      fields: [typePositionLang.lang],
      references: [languages.id],
    }),
  })
);

export const regionRelations = relations(regions, ({ many }) => ({
  langs: many(regionsLang),
}));

export const regionLangRelations = relations(regionsLang, ({ one }) => ({
  region: one(regions, {
    fields: [regionsLang.regionId],
    references: [regions.id],
  }),
  l: one(languages, {
    fields: [regionsLang.lang],
    references: [languages.id],
  }),
}));

export const subgroupRelations = relations(subgroups, ({ many, one }) => ({
  langs: many(subgroupsLang),
  group: one(groups, {
    fields: [subgroups.groupId],
    references: [groups.id],
  }),
  subgroupsToCategories: many(subgroupToCategories),
}));

export const subgroupsLangRelations = relations(subgroupsLang, ({ one }) => ({
  subgroup: one(subgroups, {
    fields: [subgroupsLang.subgroupId],
    references: [subgroups.id],
  }),
  l: one(languages, {
    fields: [subgroupsLang.lang],
    references: [languages.id],
  }),
}));

export const repertoryRelations = relations(repertories, ({ many, one }) => ({
  langs: many(repertoriesLang),
  group: one(groups, {
    fields: [repertories.groupId],
    references: [groups.id],
  }),
}));

export const repertoriesLangRelations = relations(
  repertoriesLang,
  ({ one }) => ({
    repertory: one(repertories, {
      fields: [repertoriesLang.repertoryId],
      references: [repertories.id],
    }),
    l: one(languages, {
      fields: [repertoriesLang.lang],
      references: [languages.id],
    }),
  })
);

export const subgroupsToCategoriesRelations = relations(
  subgroupToCategories,
  ({ one }) => ({
    subgroup: one(subgroups, {
      fields: [subgroupToCategories.subgroupId],
      references: [subgroups.id],
    }),
    category: one(categories, {
      fields: [subgroupToCategories.categoryId],
      references: [categories.id],
    }),
  })
);

export const SubPagesRelations = relations(SubPagesProd, ({ many, one }) => ({
  texts: many(SubPagesTextsLangProd),
  country: one(countries, {
    fields: [SubPagesProd.countryId],
    references: [countries.id],
  }),
}));

export const SubPagesTextsRelations = relations(
  SubPagesTextsLangProd,
  ({ one }) => ({
    subpage: one(SubPagesProd, {
      fields: [SubPagesTextsLangProd.subPageId],
      references: [SubPagesProd.id],
    }),
  })
);

export const MenuRelations = relations(menu, ({ many }) => ({
  lang: many(menuLang),
}));

export const MenuLangRelations = relations(menuLang, ({ one }) => ({
  menu: one(menu, {
    fields: [menuLang.menuId],
    references: [menu.id],
  }),
}));

export const designRelations = relations(design, ({ one }) => ({
  lang: one(languages, {
    fields: [design.lang],
    references: [languages.id],
  }),
}));

export const timelineRelations = relations(timeline, ({ one }) => ({
  language: one(languages, {
    fields: [timeline.lang],
    references: [languages.id],
  }),
}));
/* Schema Zod  */

export const inserUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
  password: (schema) => schema.password.min(6),
});

export const selectUserSchema = createSelectSchema(users);

export const requestAuthSchema = inserUserSchema.pick({
  email: true,
  password: true,
});

export const accountFieldsSchema = inserUserSchema.pick({
  firstname: true,
  lastname: true,
  email: true,
});

export const insertEventSchema = createInsertSchema(events);

export const selectEventSchema = createSelectSchema(events);

export const insertEventLangSchema = createInsertSchema(eventsLang, {
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

export const insertFestivalSchema = createInsertSchema(festivals, {
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
  linkConditions: (schema) => schema.linkConditions.url(),
});

export const insertFestivalLangSchema = createInsertSchema(festivalsLang, {
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

export const insertGroupSchema = createInsertSchema(groups, {
  generalDirectorName: (schema) => schema.generalDirectorName.min(1),
  artisticDirectorName: (schema) => schema.generalDirectorName.min(1),
});

export const insertGroupByNSSchema = insertGroupSchema.pick({
  id: true,
});

export const insertGroupLangSchema = createInsertSchema(groupsLang, {
  name: (schema) => schema.name.min(1),
  generalDirectorProfile: (schema) => schema.name.min(1),
  artisticDirectorProfile: (schema) => schema.name.min(1),
});

export const selectFestivalSchema = createSelectSchema(festivals);

export const insertReportNationalSectionsSchema = createInsertSchema(
  reportNationalSections
);

export const insertReportNationalSectionLangSchema = createInsertSchema(
  reportNationalSectionsLang,
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

export const insertNationalSectionSchema = createInsertSchema(nationalSections);

export const inserNationalSectionLangSchema = createInsertSchema(
  nationalSectionsLang,
  {
    name: (schema) => schema.name.min(1),
    about: (schema) => schema.about.min(1),
  }
);
export const insertNationalSectionPositionsSchema = createInsertSchema(
  nationalSectionsPositions,
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
  nationalSectionPositionsLang,
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
  socialMediaLinks,
  {
    instagramLink: (schema) => schema.instagramLink.url(),
    facebookLink: (schema) => schema.facebookLink.url(),
    websiteLink: (schema) => schema.websiteLink.url(),
  }
);

export const insertSubGroupSchema = createInsertSchema(subgroups);

export const insertSubGroupLangSchema = createInsertSchema(subgroupsLang);

export const insertRepertorySchema = createInsertSchema(repertories);

export const insertRepertoryLangSchema = createInsertSchema(repertoriesLang);

export const insertfestivalPhotosSchema = createInsertSchema(festivalPhotos);

export const insertFestivalPhotosSchema = createInsertSchema(festivalPhotos);

export const selectFestivalPhotosSchema = createSelectSchema(festivalPhotos);

export const insertSubPagesSchema = createInsertSchema(SubPagesProd);

export const insertSubPagesTextsLangSchema = createInsertSchema(
  SubPagesTextsLangProd
);

/* Infered Types */
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertEvent = typeof events.$inferInsert;
export type SelectEvent = typeof events.$inferSelect;

export type InsertEventLang = typeof eventsLang.$inferInsert;
export type SelectEventLang = typeof eventsLang.$inferSelect;

export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;

export type InsertFestival = typeof festivals.$inferInsert;
export type SelectFestival = typeof festivals.$inferSelect;

export type InsertFestivalLang = typeof festivalsLang.$inferInsert;
export type SelectFestivalLang = typeof festivalsLang.$inferSelect;

export type InsertGroup = typeof groups.$inferInsert;
export type SelectGroup = typeof groups.$inferSelect;

export type InsertGroupLang = typeof groupsLang.$inferInsert;
export type SelectGroupLang = typeof groupsLang.$inferSelect;

export type InsertSubGroupLang = typeof subgroupsLang.$inferInsert;
export type SelectSubGroupLang = typeof subgroupsLang.$inferSelect;

export type InsertRepertoryLang = typeof repertoriesLang.$inferInsert;
export type SelectRepertoryLang = typeof repertoriesLang.$inferSelect;

export type InsertCountries = typeof countries.$inferInsert;
export type SelectCountries = typeof countries.$inferSelect;

export type InsertCountryLang = typeof countriesLang.$inferInsert;
export type SelectCountryLang = typeof countriesLang.$inferSelect;

export type InsertStorage = typeof storages.$inferInsert;
export type SelectStorage = typeof storages.$inferSelect;

export type InsertLanguages = typeof languages.$inferInsert;
export type SelectLanguages = typeof languages.$inferSelect;

export type InsertRoles = typeof roles.$inferInsert;
export type SelectRoles = typeof roles.$inferSelect;

export type InsertPermissions = typeof permissions.$inferInsert;
export type SelectPermissions = typeof permissions.$inferSelect;

export type InsertRolesToPermissions = typeof rolesToPermissions.$inferInsert;
export type SelectRolesToPermissions = typeof rolesToPermissions.$inferSelect;

export type InsertFestivalToCategories =
  typeof festivalToCategories.$inferInsert;
export type SelectFestivalToCategories =
  typeof festivalToCategories.$inferSelect;

export type InsertStatus = typeof statuses.$inferInsert;
export type SelectStatus = typeof statuses.$inferSelect;

export type InsertNationalSection = typeof nationalSections.$inferInsert;
export type SelectNationalSection = typeof nationalSections.$inferSelect;

export type InsertNationalSectionLang =
  typeof nationalSectionsLang.$inferInsert;
export type SelectNationalSectionLang =
  typeof nationalSectionsLang.$inferSelect;

export type InsertNationalSectionPositions =
  typeof nationalSectionsPositions.$inferInsert;
export type SelectNationalSectionPositions =
  typeof nationalSectionsPositions.$inferSelect;

export type InsertNationalSectionPositionsLang =
  typeof nationalSectionPositionsLang.$inferInsert;
export type SelectNationalSectionPositionsLang =
  typeof nationalSectionPositionsLang.$inferSelect;

export type InsertTransportLocations = typeof transportLocations.$inferInsert;
export type SelectTransportLocations = typeof transportLocations.$inferSelect;

export type InsertFestivalToConnected =
  typeof festivalsToConnected.$inferInsert;
export type SelectFestivalToConnected =
  typeof festivalsToConnected.$inferSelect;

export type InsertFestivalToGroups = typeof festivalsToGroups.$inferInsert;
export type SelectFestivalToGroups = typeof festivalsToGroups.$inferSelect;

export type InsertFestivalPhotos = typeof festivalPhotos.$inferInsert;
export type SelectFestivalPhotos = typeof festivalPhotos.$inferSelect;

export type InsertGroupPhotos = typeof groupPhotos.$inferInsert;
export type SelectGroupPhotos = typeof groupPhotos.$inferSelect;

export type InsertFestivalStagePhotos = typeof festivalStagePhotos.$inferInsert;
export type SelectFestivalStagePhotos = typeof festivalStagePhotos.$inferSelect;

export type SelectOwner = typeof owners.$inferSelect;
