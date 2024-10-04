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

// Custom SQL Function
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

// Enums
export const stateModeEnum = pgEnum("state_mode", ["offline", "online"]);
export const langCodeEnum = pgEnum("lang_code", ["en", "es", "fr"]);

/* Users Table */

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
    password: text("password"),
    active: boolean("active").default(false),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    photoId: integer("image_id").references(() => storages.id),
    isCreationNotified: boolean("is_creation_notified").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    emailUniqueIndex: uniqueIndex("emailUniqueIndex").on(lower(table.email)),
  })
);

/* Account Table */

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

/* Session Table */

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/* Verification Token Table */

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

/* Authenticator Table */

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

/* Storage Table */

export const storages = pgTable("storages", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  name: text("name"),
  aux: text("aux"),
  keywords: text("keywords"),
  isFile: boolean("is_file").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Events Table */

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  startDate: timestamp("start_date", { mode: "date" }),
  endDate: timestamp("end_date", { mode: "date" }),
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

/* Festivals Table */

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
  countryId: integer("country_id").references(() => countries.id),
  statusId: integer("status_id").references(() => statuses.id),
  nsId: integer("ns_id").references(() => nationalSections.id),
  logoId: integer("logo_id").references(() => storages.id),
  coverId: integer("cover_id").references(() => storages.id),
  certificationMemberId: integer("certification_member_id").references(
    () => storages.id
  ),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const festivalsLang = pgTable("festivals_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  description: text("description").notNull().default(""),
  address: text("address"),
  otherTranslatorLanguage: text("other_translator_language"),
  lang: integer("lang").references(() => languages.id),
  festivalId: integer("festival_id").references(() => festivals.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Festival Photos */

export const festivalPhotos = pgTable("festival_photos", {
  id: serial("id").primaryKey(),
  festivalId: integer("festival_id").references(() => festivals.id),
  photoId: integer("photo_id").references(() => storages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Categories Table */

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
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

/* Category groups Table */

export const categoryGroups = pgTable("category_groups", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Groups Table */

export const groups = pgTable("groups", {
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
    () => storages.id
  ),
  artisticDirectorPhotoId: integer("artistic_director_photo_id").references(
    () => storages.id
  ),
  musicalDirectorPhotoId: integer("musical_director_photo_id").references(
    () => storages.id
  ),
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

/* Subgroups Table  */

export const subgroups = pgTable("subgroups", {
  id: serial("id").primaryKey(),
  membersNumber: integer("members_number"),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  groupId: integer("group_id").references(() => groups.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const subgroupsLang = pgTable("subgroups_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  contactAddress: text("contact_address"),
  subgroupId: integer("subgroup_id").references(() => subgroups.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Subgroup to Categories */

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

/* Events to Groups */

export const eventsToGroups = pgTable("events_to_groups", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  groupId: integer("group_id").references(() => groups.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Docs Table */
export const docsTable = pgTable("docs", {
  id: serial("id").primaryKey(),
  title: text("title"),
  docfile: text("docfile").notNull(),
  docKeywords: text("dockeywords"),
  lang: text("lang"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Countries Table */

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  slug: text("slug"),
  nativeLang: integer("native_lang").references(() => languages.id),
  lat: text("lat"),
  lng: text("lng"),
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

/* Countries Lang Index Table */

export const countriesLangIndexTable = pgTable("countries_lang_index", {
  id: serial("id").primaryKey(),
  en: integer("en"),
  es: integer("es"),
  fr: integer("fr"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Languages Table */

export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: langCodeEnum("code").notNull().default("en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Roles Table */

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Permissions Table */

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name"),
  active: boolean("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Status Table */

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

/* Roles to Permissions Table */

export const rolesToPermissions = pgTable("roles_to_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => roles.id),
  permissionId: integer("permission_id").references(() => permissions.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Festival to categories Table */

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

/* Festival to statuses Table */

export const festivalsToStatuses = pgTable(
  "festivals_to_statuses",
  {
    festivalId: integer("festival_id").references(() => festivals.id),
    statusId: integer("status_id").references(() => statuses.id),
    question: text("question"),
    answer: text("text"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.festivalId, t.statusId] }),
  })
);

/* Groups to categories Table */

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

/* National Sections */

export const nationalSections = pgTable("national_section", {
  id: serial("id").primaryKey(),
  published: boolean("published").default(false),
  slug: text("slug").notNull(),
  countryId: integer("country_id").references(() => countries.id),
  socialMediaLinksId: integer("socia_media_links_id").references(
    () => socialMediaLinks.id
  ),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const nationalSectionsLang = pgTable("national_section_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  about: text("about").notNull(),
  aboutYoung: text("about_young").notNull(),
  lang: integer("lang").references(() => languages.id),
  nsId: integer("ns_id").references(() => nationalSections.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const nationalSectionsPositions = pgTable("national_section_positions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  birthDate: date("birth_date", { mode: "date" }),
  deadDate: date("dead_date", { mode: "date" }),
  isHonorable: boolean("is_honorable").default(false),
  photoId: integer("photo_id").references(() => storages.id),
  nsId: integer("ns_id").references(() => nationalSections.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const nationalSectionPositionsLang = pgTable(
  "national_section_positions_lang",
  {
    id: serial("id").primaryKey(),
    shortBio: text("short_bio").notNull(),
    lang: integer("lang").references(() => languages.id),
    nsPositionsId: integer("ns_positions_id").references(
      () => nationalSectionsPositions.id
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

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

/* Reports National Sections Table */

export const reportNationalSections = pgTable("report_ns", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  festivalSize: integer("festival_size"),
  groupSize: integer("group_size"),
  associationSize: integer("association_size"),
  individualMemberSize: integer("individual_memeber_size"),
  numberFestivals: integer("number_festivals"),
  numberGroups: integer("number_groups"),
  numberAssociationsOrOtherOrganizations: integer(
    "number_associations_or_other_organizations"
  ),
  numberIndividualMembers: integer("number_individual_members"),
  isActivelyEngagedNc: boolean("is_actively_engaged_nc"),
  activeNationalCommission: boolean("active_national_commission"),
  workDescription: text("work_description"),
  countryId: integer("country_id").references(() => countries.id),
  nsId: integer("ns_id")
    .references(() => nationalSections.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const reportNationalSectionsLang = pgTable("report_ns_lang", {
  id: serial("id").primaryKey(),
  title: text("title"),
  comment: text("comment"),
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

/* Festivals Reports */

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

/* Festival Rating */

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

export const ratingFestivalResultsLang = pgTable(
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

/* Groups Reports */

export const ReportGroup = pgTable("report_group", {
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
    .references(() => ReportGroup.id)
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
    .references(() => languages.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Owners */

export const owners = pgTable("owners", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  festivalId: integer("festival_id").references(() => festivals.id),
  groupId: integer("group_id").references(() => groups.id),
  nsId: integer("ns_id").references(() => nationalSections.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Social Media Links */

export const socialMediaLinks = pgTable("social_media_links", {
  id: serial("id").primaryKey(),
  facebookLink: text("facebook_link"),
  instagramLink: text("instagram_link"),
  websiteLink: text("website_link"),
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

export const timeline = pgTable("timeline", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  videoId: text("video_id"),
  mediaId: integer("media_id").references(() => storages.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const timelineLang = pgTable("timeline_lang", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lang: integer("lang").references(() => languages.id),
  timelineId: integer("timeline_id").references(() => timeline.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const design = pgTable("design", {
  id: serial("id").primaryKey(),
  bannerMediaId: integer("banner_media_id")
    .references(() => storages.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const menu = pgTable("menu", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  order: integer("order"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const menuLang = pgTable("menu_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  lang: integer("lang").references(() => languages.id),
  menuId: integer("menu_id").references(() => menu.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  to: text("to").notNull(),
  from: text("from").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  categoryNames: text("category_names").notNull(),
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

/* Subpages */

export const SubPages = pgTable("sub_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  url: text("url").notNull(),
  isNews: boolean("is_news").default(false),
  originalDate: timestamp("original_date", { mode: "date" }).notNull(),
  published: boolean("published").default(false),
  createdBy: text("created_by").references(() => users.id),
  updatedBy: text("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const SubPagesTextsLang = pgTable("sub_pages_texts_lang", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lang: integer("lang").references(() => languages.id),
  subPageId: integer("subpage_id").references(() => SubPages.id),
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
  tag: text("tag"),
});

/* Relations */

export const userRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export const festivalRelations = relations(festivals, ({ many, one }) => ({
  festivalsToCategories: many(festivalToCategories),
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
  langs: many(festivalsLang),
  owners: many(owners),
  events: many(events),
}));

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

export const countriesRelations = relations(countries, ({ many }) => ({
  festivals: many(festivals),
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

export const groupsRelations = relations(groups, ({ one, many }) => ({
  country: one(countries, {
    fields: [groups.countryId],
    references: [countries.id],
  }),
  directorPhoto: one(storages, {
    fields: [groups.generalDirectorPhotoId],
    references: [storages.id],
  }),
  ns: one(nationalSections, {
    fields: [groups.nsId],
    references: [nationalSections.id],
  }),
  langs: many(groupsLang),
  owners: many(owners),
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
  reportNationalSections,
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
    aboutYoung: (schema) => schema.aboutYoung.min(1),
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

export type InsertDocs = typeof docsTable.$inferInsert;
export type SelectDocs = typeof docsTable.$inferSelect;

export type InsertCountries = typeof countries.$inferInsert;
export type SelectCountries = typeof countries.$inferSelect;

export type InsertCountriesLangIndex =
  typeof countriesLangIndexTable.$inferInsert;
export type SelectCountriesLangIndex =
  typeof countriesLangIndexTable.$inferSelect;

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

/** CIOFF Daniel Schema */

export const cioffSchema = pgSchema("public_2");

/*
1. USER MODULE:
Roles
Permissions
Roles to Permissions
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

export const RolesProd = cioffSchema.table("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const PermissionsProd = cioffSchema.table("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const RolesToPermissionsProd = cioffSchema.table(
  "roles_to_permissions",
  {
    id: serial("id").primaryKey(),
    roleId: integer("role_id").references(() => RolesProd.id),
    permissionId: integer("permission_id").references(() => PermissionsProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const LanguagesProd = cioffSchema.table("languages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: langCodeEnum("code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CountriesProd = cioffSchema.table("countries", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  lat: text("lat"),
  lng: text("lng"),
  nativeLang: integer("native_lang").references(() => LanguagesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CountriesLangProd = cioffSchema.table("countries_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  countryId: integer("country_id").references(() => CountriesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const UsersProd = cioffSchema.table("users", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => RolesProd.id),
  countryId: integer("country_id").references(() => CountriesProd.id),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  password: text("password").notNull(),
  firstname: text("firstname").notNull(),
  lastname: text("lastname").notNull(),
  title: text("title"),
  address: text("address"),
  city: text("city"),
  zip: text("zip"),
  phone: text("phone"),
  image: integer("image_id").references(() => StorageProd.id),
  active: boolean("active").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const AccountsProd = pgTable(
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
export const SessionsProd = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
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
export const SocialMediaLinksProd = cioffSchema.table("social_media_links", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  link: text("link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const StorageProd = cioffSchema.table("storage", {
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

/*
4. CATEGORY MODULE:
Categories
Categories Lang

5. FESTIVAL MODULE:
Events
Festivals Lang
Festivals
Festivals Photos
Festival to categories
*/

export const CategoriesProd = cioffSchema.table("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const CategoriesLangProd = cioffSchema.table("categories_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  categoryId: integer("category_id").references(() => CategoriesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalsProd = cioffSchema.table("festivals", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  stateMode: stateModeEnum("state_mode").default("offline"),
  urlValidated: boolean("url_validated").default(false),
  directorName: text("director_name").notNull().default(""),
  email: text("email"),
  url: text("url"),
  contact: text("contact"),
  phone: text("phone"),
  lat: text("lat"),
  lng: text("lng"),
  transportLat: text("transport_lat"),
  transportLng: text("transport_lng"),
  youtubeId: text("youtube_id"),
  published: boolean("published").default(false),
  countryId: integer("country_id").references(() => CountriesProd.id),
  logoId: integer("logo_id").references(() => StorageProd.id),
  coverId: integer("cover_id").references(() => StorageProd.id),
  createdBy: integer("created_by").references(() => UsersProd.id),
  updatedBy: integer("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalsLangProd = cioffSchema.table("festivals_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  description: text("description").notNull().default(""),
  address: text("address").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalPhotosProd = cioffSchema.table("festival_photos", {
  id: serial("id").primaryKey(),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  photoId: integer("photo_id").references(() => StorageProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const FestivalToCategoriesProd = cioffSchema.table(
  "festival_to_categories",
  {
    id: serial("id").primaryKey(),
    festivalId: integer("festival_id").references(() => FestivalsProd.id),
    categoryId: integer("category_id").references(() => CategoriesProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const EventsProd = cioffSchema.table("events", {
  id: serial("id").primaryKey(),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/*
6. GROUP MODULE:
Type groups
Groups
Groups Lang
EventsToGroups
*/

export const TypeGroupsProd = cioffSchema.table("type_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const GroupsProd = cioffSchema.table("groups", {
  id: serial("id").primaryKey(),
  slug: text("slug"),
  phone: text("phone"),
  generalDirectorName: text("general_director_name").notNull(),
  artisticDirectorName: text("artistic_director_name"),
  generalDirectorPhotoId: integer("general_director_photo_id").references(
    () => StorageProd.id
  ),
  artisticDirectorPhotoId: integer("artistic_director_photo_id").references(
    () => StorageProd.id
  ),
  typeId: integer("type_id").references(() => TypeGroupsProd.id),
  createdBy: integer("created_by").references(() => UsersProd.id),
  updatedBy: integer("updated_by").references(() => UsersProd.id),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const GroupsLangProd = cioffSchema.table("groups_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  address: text("address").notNull(),
  generalDirectorProfile: text("general_director_profile"),
  artisticDirectorProfile: text("artistic_director_profile"),
  lang: integer("lang").references(() => LanguagesProd.id),
  groupId: integer("group_id").references(() => GroupsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const EventsToGroupsProd = cioffSchema.table("events_to_groups", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => EventsProd.id),
  groupId: integer("group_id").references(() => GroupsProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/*
7. NATIONAL SECTION MODULE:
National Section
National Section Lang
National Section Positions
National Section Positions Lang
*/

export const NationalSectionProd = cioffSchema.table("national_section", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  published: boolean("published").default(false),
  countryId: integer("country_id").references(() => CountriesProd.id),
  createdBy: integer("created_by").references(() => UsersProd.id),
  updatedBy: integer("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const NationalSectionLangProd = cioffSchema.table(
  "national_section_lang",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    about: text("about"),
    aboutYoung: text("about_young"),
    nsId: integer("ns_id").references(() => NationalSectionProd.id),
    lang: integer("lang").references(() => LanguagesProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const NationalSectionPositionsProd = cioffSchema.table(
  "national_section_positions",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull().unique(),
    birthDate: timestamp("birth_date", { mode: "date" }).notNull(),
    deadDate: timestamp("dead_date", { mode: "date" }),
    isHonorable: boolean("is_honorable").default(false),
    photoId: integer("photo_id").references(() => StorageProd.id),
    nsId: integer("ns_id").references(() => NationalSectionProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const NationalSectionPositionsLangProd = cioffSchema.table(
  "national_section_positions_lang",
  {
    id: serial("id").primaryKey(),
    shortBio: text("short_bio").notNull(),
    lang: integer("lang").references(() => LanguagesProd.id),
    nsPositionsId: integer("ns_positions_id").references(
      () => NationalSectionPositionsProd.id
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
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

export const TimelineProd = cioffSchema.table("timeline", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  videoId: text("video_id"),
  mediaId: integer("media_id").references(() => StorageProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const TimelineLangProd = cioffSchema.table("timeline_lang", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  timelineId: integer("timeline_id").references(() => TimelineProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const DesignProd = cioffSchema.table("design", {
  id: serial("id").primaryKey(),
  bannerMediaId: integer("banner_media_id")
    .references(() => StorageProd.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const MenuProd = cioffSchema.table("menu", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  order: integer("order"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const MenuLangProd = cioffSchema.table("menu_lang", {
  id: serial("id").primaryKey(),
  name: text("name"),
  lang: integer("lang").references(() => LanguagesProd.id),
  menuId: integer("menu_id").references(() => MenuProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const EmailsProd = cioffSchema.table("announcements", {
  id: serial("id").primaryKey(),
  to: text("to").notNull(),
  from: text("from").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  categoryNames: text("category_names").notNull(),
  createdBy: integer("created_by").references(() => UsersProd.id),
  updatedBy: integer("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const EmailsDocsProd = cioffSchema.table("announcements_files", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").references(() => EmailsProd.id),
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

export const SubPagesProd = cioffSchema.table("sub_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  url: text("url").notNull(),
  isNews: boolean("is_news").default(false),
  originalDate: timestamp("original_date", { mode: "date" }).notNull(),
  published: boolean("published").default(false),
  createdBy: integer("created_by").references(() => UsersProd.id),
  updatedBy: integer("updated_by").references(() => UsersProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const SubPagesTextsLangProd = cioffSchema.table("sub_pages_texts_lang", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  subPageId: integer("subpage_id").references(() => SubPagesProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 12. Owers */

export const OwnersProd = cioffSchema.table("owners", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => UsersProd.id),
  festivalId: integer("festival_id").references(() => FestivalsProd.id),
  groupId: integer("group_id").references(() => GroupsProd.id),
  nsId: integer("ns_id").references(() => NationalSectionProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* 13. Type Reports */

export const ReportTypeCategoriesProd = cioffSchema.table(
  "report_type_categories",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    oriented_to: text("oriented_to"),
    subType: text("subType"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const ReportTypeCategoriesNsLangProd = cioffSchema.table(
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

export const RatingTypeProd = cioffSchema.table("rating_type", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const RatingQuestionsProd = cioffSchema.table("rating_questions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  ratingTypeId: integer("rating_type_id").references(() => RatingTypeProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const RatingQuestionsLangProd = cioffSchema.table(
  "rating_questions_lang",
  {
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
  }
);

/* 15. NS Reports */

export const ReportNsProd = cioffSchema.table("report_ns", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  nsId: integer("ns_id")
    .references(() => NationalSectionProd.id)
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
export const ReportNsLangProd = cioffSchema.table("report_ns_lang", {
  id: serial("id").primaryKey(),
  title: text("title"),
  comment: text("comment"),
  lang: integer("lang")
    .references(() => LanguagesProd.id)
    .notNull(),
  reportNsId: integer("report_ns_id")
    .references(() => ReportNsProd.id)
    .notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const ReportNsActivitiesProd = cioffSchema.table(
  "report_ns_activities",
  {
    id: serial("id").primaryKey(),
    reportTypeCategoryId: integer("report_type_category_id")
      .references(() => ReportTypeCategoriesProd.id)
      .notNull(),
    reportNsId: integer("report_ns_id")
      .references(() => ReportNsProd.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

/* 16. Festivals Reports */

export const ReportFestivalProd = cioffSchema.table("report_festival", {
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
export const ReportFestivalActivitiesProd = cioffSchema.table(
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

/* 17. Groups Reports */

export const ReportGroupProd = cioffSchema.table("report_group", {
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

/* 18. Festival Rating */

export const RatingFestivalToGroupsProd = cioffSchema.table(
  "rating_festival_to_groups",
  {
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
  }
);
export const RatingFestivalToGroupsAnswersProd = cioffSchema.table(
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
export const RatingFestivalToGroupsAnswersLangProd = cioffSchema.table(
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
export const RatingFestivalResultsLangProd = cioffSchema.table(
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

/* 19. Group Rating */

export const RatingGroupToFestivalsProd = cioffSchema.table(
  "rating_group_to_festivals",
  {
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
    financialCompensationPerMember: integer(
      "financial_compensation_per_member"
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
export const ReportGroupTypeLocalesProd = cioffSchema.table(
  "report_group_type_locales",
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
export const ReportGroupTypeLocalesSleepProd = cioffSchema.table(
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
export const RatingGroupToFestivalsAnswersProd = cioffSchema.table(
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
export const RatingGroupAnswersLangProd = cioffSchema.table(
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
export const RatingGroupResultsLangProd = cioffSchema.table(
  "rating_group_results_lang",
  {
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
  }
);
