import { relations, SQL, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  integer,
  pgEnum,
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
import slug from "slug";

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
    roleId: integer("role_id").references(() => rolesTable.id),
    countryId: integer("country_id"),
    title: text("title"),
    name: text("name"),
    firstname: text("firstname"),
    lastname: text("lastname"),
    email: text("email").notNull(),
    address: text("address"),
    city: text("city"),
    zip: text("zip"),
    phone: text("phone"),
    image: text("image"),
    password: text("password"),
    active: boolean("active").default(false),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
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

export const StorageProd = pgTable("storage", {
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
  stateMode: stateModeEnum("state_mode").default("offline"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  logo: text("logo"),
  url: text("url"),
  approved: boolean("approved"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Festivals Table */

export const festivals = pgTable("festivals", {
  id: serial("id").primaryKey(),
  address: text("address"),
  name: text("name").notNull(),
  email: text("email"),
  ownerId: text("owner_id").references(() => users.id),
  url: text("url"),
  contact: text("contact").notNull().default(""),
  countryId: integer("country_id"),
  urlValidated: boolean("url_validated"),
  description: text("description").notNull().default(""),
  phone: text("phone"),
  stateMode: stateModeEnum("state_mode").default("offline"),
  location: text("location"),
  currentDates: text("current_dates"),
  nextDates: text("next_dates"),
  lat: text("lat"),
  lng: text("lng"),
  transportLat: text("transport_lat"),
  transportLng: text("transport_lng"),
  translatorLanguages: text("translator_languages"),
  peoples: integer("peoples"),
  logo: text("logo"),
  cover: text("cover"),
  photos: text("photos"),
  youtubeId: text("youtube_id"),
  directorName: text("director_name").notNull().default(""),
  categories: text("categories"),
  lang: integer("lang"),
  publish: boolean("publish"),
  certificationMemberId: integer("certification_member_id").references(
    () => StorageProd.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Categories Table */

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  caption: text("caption"),
  categoryGroupId: integer("category_group_id").references(
    () => categoryGroups.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Type groups Table */

export const typeGroups = pgTable("type_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
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
  name: text("name").notNull(),
  ownerId: text("owner_id").references(() => users.id),
  generalDirectorName: text("general_director_name"),
  generalDirectorProfile: text("general_director_profile"),
  generalDirectorPhoto: text("general_director_photo"),
  directorPhotoStorageId: integer("director_photo_storage_id").references(
    () => StorageProd.id
  ),
  artisticDirectorName: text("artistic_director_name"),
  artisticDirectorProfile: text("artistic_director_profile"),
  artisticDirectorPhoto: text("artistic_director_photo"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  typeId: integer("type_id"),
  countryId: integer("country_id").references(() => countriesTable.id),
  description: text("description"),
  certificationMemberId: integer("certification_member_id").references(
    () => StorageProd.id
  ),
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

export const countriesTable = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name"),
  lang: integer("lang"),
  lat: text("lat"),
  lng: text("lng"),
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

export const LanguagesProd = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: langCodeEnum("code").notNull().default("en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Roles Table */

export const rolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name"),
  active: boolean("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Permissions Table */

export const permissionsTable = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name"),
  active: boolean("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Status Table */

export const statusTable = pgTable("statuses", {
  id: serial("id").primaryKey(),
  name: text("name"),
  slug: text("slug"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Roles to Permissions Table */

export const rolesToPermissionsTable = pgTable("roles_to_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id"),
  permissionId: integer("permission_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* Festival to categories Table */

export const festivalsToCategoriesTable = pgTable(
  "festivals_to_categories",
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

export const festivalsToStatusesTable = pgTable(
  "festivals_to_statuses",
  {
    festivalId: integer("festival_id").references(() => festivals.id),
    statusId: integer("status_id").references(() => statusTable.id),
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

export const groupsToCategoriesTable = pgTable(
  "groups_to_categories",
  {
    groupId: integer("festival_id").references(() => groups.id),
    categoryId: integer("category_id").references(() => categories.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.categoryId] }),
  })
);

/* 7. NATIONAL SECTION MODULE:
National Section
National Section Lang
National Section Positions
National Section Positions Lang
*/

export const NationalSectionProd = pgTable("national_section", {
  id: serial("id").primaryKey(),
  published: boolean("published").default(false),
  countryId: integer("country_id").references(() => countriesTable.id),
  ownerId: text("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const NationalSectionLangProd = pgTable("national_section_lang", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  about: text("about").notNull(),
  aboutYoung: text("about_young").notNull(),
  lang: integer("lang").references(() => LanguagesProd.id),
  nsId: integer("ns_id").references(() => NationalSectionProd.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const NationalSectionPositionsProd = pgTable(
  "national_section_positions",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull().unique(),
    birthDate: timestamp("birth_date", { mode: "date" }),
    deadDate: timestamp("dead_date", { mode: "date" }),
    isHonorable: boolean("is_honorable").default(false),
    photoId: integer("photo_id").references(() => StorageProd.id),
    nsId: integer("ns_id").references(() => NationalSectionProd.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);

export const NationalSectionPositionsLangProd = pgTable(
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

/* Reports National Sections Table */

export const reportNationalSections = pgTable("report_national_sections", {
  id: serial("id").primaryKey(),
  festivalSize: integer("festival_size"),
  groupSize: integer("group_size"),
  associationSize: integer("association_size"),
  individualMemberSize: integer("individual_memeber_size"),
  activeNationalCommission: boolean("active_national_commission"),
  workDescription: text("work_description"),
  countryId: integer("country_id").references(() => countriesTable.id),
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

/* Relations */

export const userRelations = relations(users, ({ one }) => ({
  role: one(rolesTable, {
    fields: [users.roleId],
    references: [rolesTable.id],
  }),
}));

export const festivalRelations = relations(festivals, ({ many, one }) => ({
  festivalsToCategories: many(festivalsToCategoriesTable),
  country: one(countriesTable, {
    fields: [festivals.countryId],
    references: [countriesTable.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  festivalsToCategories: many(festivalsToCategoriesTable),
  categoryGroup: one(categoryGroups, {
    fields: [categories.categoryGroupId],
    references: [categoryGroups.id],
  }),
}));

export const categoryGroupsRealtions = relations(
  categoryGroups,
  ({ many }) => ({
    categories: many(categories),
  })
);

export const countriesRelations = relations(countriesTable, ({ many }) => ({
  festivals: many(festivals),
}));

export const festivalsToCategoriesRelations = relations(
  festivalsToCategoriesTable,
  ({ one }) => ({
    festival: one(festivals, {
      fields: [festivalsToCategoriesTable.festivalId],
      references: [festivals.id],
    }),
    category: one(categories, {
      fields: [festivalsToCategoriesTable.categoryId],
      references: [categories.id],
    }),
  })
);

export const groupsRelations = relations(groups, ({ one }) => ({
  type: one(typeGroups, {
    fields: [groups.typeId],
    references: [typeGroups.id],
  }),
  country: one(countriesTable, {
    fields: [groups.countryId],
    references: [countriesTable.id],
  }),
  directorPhoto: one(StorageProd, {
    fields: [groups.directorPhotoStorageId],
    references: [StorageProd.id],
  }),
}));

export const typeGroupsRelations = relations(typeGroups, ({ many }) => ({
  groups: many(groups),
}));

export const nationalSectionRelations = relations(
  NationalSectionProd,
  ({ many }) => ({
    langs: many(NationalSectionLangProd),
  })
);

export const nationalSectionLangRelations = relations(
  NationalSectionLangProd,
  ({ one }) => ({
    ns: one(NationalSectionProd, {
      fields: [NationalSectionLangProd.nsId],
      references: [NationalSectionProd.id],
    }),
  })
);

/* Schema */

export const inserUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
  password: (schema) => schema.password.min(6),
});

export const selectUserSchema = createSelectSchema(users);

export const requestAuthSchema = inserUserSchema.pick({
  email: true,
  password: true,
});

export const insertEventSchema = createInsertSchema(events, {
  description: (schema) => schema.description.min(20),
});

export const selectEventSchema = createSelectSchema(events);

export const insertFestivalSchema = createInsertSchema(festivals, {
  name: (schema) => schema.name.min(1),
  email: (schema) => schema.email.min(1).email(),
  directorName: (schema) => schema.directorName.min(1),
  contact: (schema) => schema.contact.min(1),
  location: (schema) => schema.location.min(1),
  description: (schema) =>
    schema.description.min(1).refine(
      (value) => {
        return value.split(" ").length <= 500;
      },
      {
        message: "Description can't be more than 500 words",
      }
    ),
  phone: (schema) =>
    schema.phone.min(1).refine(
      (value) => {
        return isPossiblePhoneNumber(value || "");
      },
      { params: { i18n: "invalid_phone_number" } }
    ),
});

export const inserFestivalByNSSchema = insertFestivalSchema.pick({
  name: true,
  email: true,
});

export const insertGroupSchema = createInsertSchema(groups, {
  name: (schema) => schema.name.min(1),
  email: (schema) => schema.email.min(1).email(),
});

export const insertGroupByNSSchema = insertGroupSchema.pick({
  name: true,
  email: true,
});

export const selectFestivalSchema = createSelectSchema(festivals);

export const insertTypeGroupSchema = createInsertSchema(typeGroups, {
  slug: (schema) =>
    schema.slug.transform((value) => (value ? slug(value) : value)),
});

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

export const insertNationalSectionSchema =
  createInsertSchema(NationalSectionProd);

export const inserNationalSectionLangSchema = createInsertSchema(
  NationalSectionLangProd
);
export const insertNationalSectionPositionsSchema = createInsertSchema(
  NationalSectionPositionsProd,
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

/* Infered Types */

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertEvent = typeof events.$inferInsert;
export type SelectEvent = typeof events.$inferSelect;

export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;

export type InsertFestival = typeof festivals.$inferInsert;
export type SelectFestival = typeof festivals.$inferSelect;

export type InsertGroup = typeof groups.$inferInsert;
export type SelectGroup = typeof groups.$inferSelect;

export type InsertTypeGroup = typeof typeGroups.$inferInsert;
export type SelectTypeGroup = typeof typeGroups.$inferSelect;

export type InsertDocs = typeof docsTable.$inferInsert;
export type SelectDocs = typeof docsTable.$inferSelect;

export type InsertCountries = typeof countriesTable.$inferInsert;
export type SelectCountries = typeof countriesTable.$inferSelect;

export type InsertCountriesLangIndex =
  typeof countriesLangIndexTable.$inferInsert;
export type SelectCountriesLangIndex =
  typeof countriesLangIndexTable.$inferSelect;

export type InsertLanguages = typeof LanguagesProd.$inferInsert;
export type SelectLanguages = typeof LanguagesProd.$inferSelect;

export type InsertRoles = typeof rolesTable.$inferInsert;
export type SelectRoles = typeof rolesTable.$inferSelect;

export type InsertPermissions = typeof permissionsTable.$inferInsert;
export type SelectPermissions = typeof permissionsTable.$inferSelect;

export type InsertRolesToPermissions =
  typeof rolesToPermissionsTable.$inferInsert;
export type SelectRolesToPermissions =
  typeof rolesToPermissionsTable.$inferSelect;

export type InsertFestivalToCategories =
  typeof festivalsToCategoriesTable.$inferInsert;
export type SelectFestivalToCategories =
  typeof festivalsToCategoriesTable.$inferSelect;

export type InsertStatus = typeof statusTable.$inferInsert;
export type SelectStatus = typeof statusTable.$inferSelect;

export type InsertNationalSection = typeof NationalSectionProd.$inferInsert;
export type SelectNationalSection = typeof NationalSectionProd.$inferSelect;

export type InsertNationalSectionLang =
  typeof NationalSectionLangProd.$inferInsert;
export type SelectNationalSectionLang =
  typeof NationalSectionLangProd.$inferSelect;

export type InsertNationalSectionPositions =
  typeof NationalSectionPositionsProd.$inferInsert;
export type SelectNationalSectionPositions =
  typeof NationalSectionPositionsProd.$inferSelect;

export type InsertNationalSectionPositionsLang =
  typeof NationalSectionPositionsLangProd.$inferInsert;
export type SelectNationalSectionPositionsLang =
  typeof NationalSectionPositionsLangProd.$inferSelect;
